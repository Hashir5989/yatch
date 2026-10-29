const { spawn } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

const v1 = 'C:/Users/Hashir/Downloads/WhatsApp Video 2026-10-29 at 9.01.18 PM.mp4';
const v2 = 'C:/Users/Hashir/Downloads/WhatsApp Video 2026-10-29 at 9.10.13 PM.mp4';
const output = path.resolve('public/videos/asmaraty-hero-banner.mp4');

console.log('Starting video combination:');
console.log('Video 1:', v1);
console.log('Video 2:', v2);
console.log('Output:', output);

if (!fs.existsSync(v1)) {
  console.error('Video 1 does not exist!');
  process.exit(1);
}
if (!fs.existsSync(v2)) {
  console.error('Video 2 does not exist!');
  process.exit(1);
}

const filterComplex = [
  '[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v0];',
  '[1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v1];',
  '[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a0];',
  '[1:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a1];',
  '[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]'
].join('');

const args = [
  '-i', v1,
  '-i', v2,
  '-filter_complex', filterComplex,
  '-map', '[v]',
  '-map', '[a]',
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '22',
  '-pix_fmt', 'yuv420p',
  '-c:a', 'aac',
  '-b:a', '192k',
  '-movflags', '+faststart',
  '-y',
  output
];

const proc = spawn(ffmpeg, args);

proc.stderr.on('data', (data) => {
  const line = data.toString();
  if (line.includes('time=') || line.includes('Duration')) {
    process.stdout.write(line);
  }
});

proc.on('close', (code) => {
  if (code === 0) {
    const stats = fs.statSync(output);
    console.log(`\nSuccessfully combined videos!`);
    console.log(`Output: ${output}`);
    console.log(`Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  } else {
    console.error(`\nFFmpeg process exited with code ${code}`);
    process.exit(code);
  }
});
