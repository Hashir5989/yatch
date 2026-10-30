const { spawn } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

/**
 * Creates the official A77 exterior daytime cruising banner video for the homepage
 * from the 4K 60fps footage (WhatsApp Video 2026-10-29 at 9.10.13 PM.mp4)
 */
const src = 'C:/Users/Hashir/Downloads/WhatsApp Video 2026-10-29 at 9.10.13 PM.mp4';
const output = path.resolve('public/videos/asmaraty-hero-banner.mp4');

if (!fs.existsSync(src)) {
  console.error('Source A77 video not found at:', src);
  process.exit(1);
}

const filter = [
  '[0:v]eq=brightness=0.03:contrast=1.06:saturation=1.14,fps=30[base];',
  '[base]split=3[s1_in][s2_in][s3_in];',
  '[s1_in]trim=0:6.0,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[shot1];',
  '[s2_in]trim=2.0:7.0,setpts=PTS-STARTPTS,crop=2800:1575:520:300,scale=1920:1080,setsar=1[shot2];',
  '[s3_in]trim=3.5:7.2,setpts=1.5*(PTS-STARTPTS),scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[shot3];',
  '[shot1][shot2]xfade=transition=fade:duration=0.8:offset=5.2[trans1];',
  '[trans1][shot3]xfade=transition=fade:duration=0.8:offset=8.6[trans2];',
  '[trans2]split=2[t_main][t_tail];',
  '[t_main]trim=0:12.55,setpts=PTS-STARTPTS[v_start];',
  '[t_tail]trim=12.55:13.35,setpts=PTS-STARTPTS[v_end];',
  '[v_end][v_start]xfade=transition=fade:duration=0.7:offset=0.1[v_final]'
].join('');

console.log('Generating A77 outside shots banner video...');
const args = [
  '-i', src,
  '-filter_complex', filter,
  '-map', '[v_final]',
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '20',
  '-pix_fmt', 'yuv420p',
  '-an',
  '-movflags', '+faststart',
  '-y',
  output
];

const proc = spawn(ffmpeg, args);
proc.on('close', (code) => {
  if (code === 0) {
    const stat = fs.statSync(output);
    console.log(`Success! Updated ${output} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  } else {
    console.error('Failed with code', code);
  }
});
