const ffmpeg = require('ffmpeg-static');
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Generates the official 15-second daylight outside yacht sailing hero banner
 * featuring dynamic sea sailing shots and the real A77 yacht cruising on open water.
 */
const v1 = 'C:/Users/Hashir/Downloads/WhatsApp Video 2026-10-29 at 9.01.18 PM.mp4';
const v2 = 'C:/Users/Hashir/Downloads/WhatsApp Video 2026-10-29 at 9.10.13 PM.mp4';
const output = path.resolve('public/videos/asmaraty-hero-banner.mp4');

// Shot 1: Open sea daylight sailing past Burj Al Arab carving wake (0.0s to 4.8s from v1)
// Shot 2: High-speed ocean cruising pass cutting through foam spray (7.3s to 9.0s from v1 -> 1.7s, strictly no AS 100 plate)
// Shot 3: Real A77 yacht bow sailing towards camera on open water (0.0s to 3.8s from v2)
// Shot 4: Real A77 yacht dynamic helm/flybridge tracking close-up (2.0s to 5.2s from v2 -> 3.2s cropped to 2700x1518)
// Shot 5: Real A77 yacht sleek profile gliding majestically across azure sea (3.6s to 7.32s from v2 -> 3.72s)

const filter = [
  // Shot 1: v1 0 to 4.8s (4.8s)
  '[0:v]trim=0:4.8,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,eq=brightness=0.04:contrast=1.08:saturation=1.20[shot1];',
  
  // Shot 2: v1 7.3 to 9.0s (1.7s)
  '[0:v]trim=7.3:9.0,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,eq=brightness=0.04:contrast=1.08:saturation=1.20[shot2];',
  
  // Shot 3: v2 0 to 3.8s (3.8s) - A77 bow approach
  '[1:v]trim=0:3.8,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,eq=brightness=0.03:contrast=1.06:saturation=1.16[shot3];',
  
  // Shot 4: v2 2.0 to 5.2s (3.2s) - A77 helm close-up tracking
  '[1:v]trim=2.0:5.2,setpts=PTS-STARTPTS,crop=2700:1518:550:350,scale=1920:1080,setsar=1,fps=30,eq=brightness=0.03:contrast=1.06:saturation=1.16[shot4];',
  
  // Shot 5: v2 3.6 to 7.32s (3.72s) - A77 side profile beauty cruising
  '[1:v]trim=3.6:7.32,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,eq=brightness=0.03:contrast=1.06:saturation=1.16[shot5];',
  
  // Crossfade transitions:
  // shot1 (4.8s) + shot2 (1.7s) @ offset 4.4s (dur 0.4s) -> length = 4.4 + 1.7 = 6.1s
  '[shot1][shot2]xfade=transition=fade:duration=0.4:offset=4.4[t1];',
  
  // t1 (6.1s) + shot3 (3.8s) @ offset 5.7s (dur 0.4s) -> length = 5.7 + 3.8 = 9.5s
  '[t1][shot3]xfade=transition=fade:duration=0.4:offset=5.7[t2];',
  
  // t2 (9.5s) + shot4 (3.2s) @ offset 9.1s (dur 0.4s) -> length = 9.1 + 3.2 = 12.3s
  '[t2][shot4]xfade=transition=fade:duration=0.4:offset=9.1[t3];',
  
  // t3 (12.3s) + shot5 (3.72s) @ offset 11.9s (dur 0.4s) -> length = 11.9 + 3.72 = 15.62s
  '[t3][shot5]xfade=transition=fade:duration=0.4:offset=11.9[t4];',
  
  // Seamless loop crossfade: blend last 0.5s into the beginning
  '[t4]split=2[loop_main][loop_tail];',
  '[loop_main]trim=0:15.12,setpts=PTS-STARTPTS[v_main];',
  '[loop_tail]trim=15.12:15.62,setpts=PTS-STARTPTS[v_tail];',
  '[v_tail][v_main]xfade=transition=fade:duration=0.5:offset=0.0[v_final]'
].join('');

console.log('Rendering master 15-second daylight sailing video...');
const start = Date.now();
const res = spawnSync(ffmpeg, [
  '-i', v1,
  '-i', v2,
  '-filter_complex', filter,
  '-map', '[v_final]',
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-crf', '20',
  '-pix_fmt', 'yuv420p',
  '-an',
  '-movflags', '+faststart',
  '-y',
  output
], { encoding: 'utf8' });

console.log(`Finished in ${((Date.now() - start) / 1000).toFixed(1)}s, exit code:`, res.status);
if (fs.existsSync(output)) {
  const stat = fs.statSync(output);
  console.log(`Success! Output created at ${output}`);
  console.log(`File size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
} else {
  console.error('Render error:', res.stderr.slice(-800));
}
