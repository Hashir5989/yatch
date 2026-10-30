const ffmpeg = require('ffmpeg-static');
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Assembles the master G77 Hero Banner Video using the realistic video cuts:
 * 1. gemini_generated_video_37a947bc.mp4 (Head-on bow wave piercing)
 * 2. gemini_generated_video_3bb50ef1.mp4 (3/4 front wave slicing action)
 * 3. gemini_generated_video_e5b4adbd.mp4 (High-speed ocean cruising pass)
 * 4. WhatsApp Video 2026-10-29 at 9.10.13 PM.mp4 (4K genuine beauty profile glide)
 * 
 * - Upper part cropped to eliminate sky/roof shimmer and frame yacht + crashing ocean water
 * - Color graded and sharpened for maximum photorealism
 * - 0.4s smooth crossfades and 0.5s seamless loop
 */

const v1 = 'C:/Users/Hashir/Downloads/gemini_generated_video_37a947bc.mp4'; // Head-on bow
const v2 = 'C:/Users/Hashir/Downloads/gemini_generated_video_3bb50ef1.mp4'; // 3/4 front
const v3 = 'C:/Users/Hashir/Downloads/gemini_generated_video_e5b4adbd.mp4'; // Side cruising
const v4 = 'C:/Users/Hashir/Downloads/WhatsApp Video 2026-10-29 at 9.10.13 PM.mp4'; // 4K Real
const output = path.resolve('public/videos/asmaraty-hero-banner.mp4');

const filter = [
  // Shot 1: Head-on Bow Wave Piercing (0 to 4.5s)
  // Crop upper 70px to remove top sky and zoom in on bow cutting waves
  '[0:v]trim=0:4.5,setpts=PTS-STARTPTS,crop=1150:647:65:70,scale=1920:1080,setsar=1,fps=30,eq=brightness=0.03:contrast=1.06:saturation=1.16,unsharp=5:5:0.8:3:3:0.4[shot1];',

  // Shot 2: 3/4 Front Wave Slicing Action (0 to 4.5s)
  // Crop upper part and center on yacht slicing sea
  '[1:v]trim=0:4.5,setpts=PTS-STARTPTS,crop=1150:647:65:70,scale=1920:1080,setsar=1,fps=30,eq=brightness=0.03:contrast=1.06:saturation=1.16,unsharp=5:5:0.8:3:3:0.4[shot2];',

  // Shot 3: High-Speed Ocean Cruising Chase (0 to 4.5s)
  // Crop upper part and focus on yacht + wake
  '[2:v]trim=0:4.5,setpts=PTS-STARTPTS,crop=1150:647:65:70,scale=1920:1080,setsar=1,fps=30,eq=brightness=0.03:contrast=1.06:saturation=1.16,unsharp=5:5:0.8:3:3:0.4[shot3];',

  // Shot 4: Genuine 4K Beauty Profile Glide (3.5 to 7.3s -> 3.8s)
  '[3:v]trim=3.5:7.3,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,eq=brightness=0.03:contrast=1.06:saturation=1.16[shot4];',

  // Transitions:
  // shot1 (4.5s) + shot2 (4.5s) @ offset 4.1s (dur 0.4s) -> length = 4.1 + 4.5 = 8.6s
  '[shot1][shot2]xfade=transition=fade:duration=0.4:offset=4.1[t1];',

  // t1 (8.6s) + shot3 (4.5s) @ offset 8.2s (dur 0.4s) -> length = 8.2 + 4.5 = 12.7s
  '[t1][shot3]xfade=transition=fade:duration=0.4:offset=8.2[t2];',

  // t2 (12.7s) + shot4 (3.8s) @ offset 12.3s (dur 0.4s) -> length = 12.3 + 3.8 = 16.1s
  '[t2][shot4]xfade=transition=fade:duration=0.4:offset=12.3[t3];',

  // Seamless loop crossfade: blend last 0.5s into the beginning
  '[t3]split=2[loop_main][loop_tail];',
  '[loop_main]trim=0:15.6,setpts=PTS-STARTPTS[v_main];',
  '[loop_tail]trim=15.6:16.1,setpts=PTS-STARTPTS[v_tail];',
  '[v_tail][v_main]xfade=transition=fade:duration=0.5:offset=0.0[v_final]'
].join('');

console.log('Rendering master G77 sailing into sea hero video...');
const start = Date.now();
const res = spawnSync(ffmpeg, [
  '-i', v1,
  '-i', v2,
  '-i', v3,
  '-i', v4,
  '-filter_complex', filter,
  '-map', '[v_final]',
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-crf', '18',
  '-pix_fmt', 'yuv420p',
  '-an',
  '-movflags', '+faststart',
  '-y',
  output
], { encoding: 'utf8' });

console.log(`Finished in ${((Date.now() - start) / 1000).toFixed(1)}s, exit code:`, res.status);
if (fs.existsSync(output)) {
  const stat = fs.statSync(output);
  console.log(`Success! Created ${output} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
} else {
  console.error('Render error:', res.stderr.slice(-800));
}
