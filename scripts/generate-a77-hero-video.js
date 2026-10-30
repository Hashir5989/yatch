const ffmpeg = require('ffmpeg-static');
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Generates an exclusive, 100% authentic G77 yacht sailing and showcasing video
 * from the genuine 4K 60fps master footage (WhatsApp Video 2026-10-29 at 9.10.13 PM.mp4).
 * 
 * - Strictly 100% G77 yacht (NO other yachts, NO AI generation)
 * - 5 distinct cinematic shots:
 *   1. Full Wide Bow Approach on Open Sea (0.0s to 3.8s)
 *   2. Dynamic Bow Water-Cutting Close-Up (1.5s to 4.5s -> 3.0s, crop 2100:1181)
 *   3. Flybridge & Helm Showcase Tracking Shot (3.0s to 6.2s -> 3.2s, crop 2200:1238)
 *   4. Sleek Hull Profile & Teardrop Window Waterline Cut (3.5s to 6.8s -> 3.3s, crop 2400:1350)
 *   5. Cinematic 60fps Broadcast Slow-Motion Beauty Glide (2.0s to 7.2s @ 0.55x speed -> 9.45s)
 * 
 * Duration: ~20.2 seconds with smooth crossfades and seamless loop.
 */

const src = 'C:/Users/Hashir/Downloads/WhatsApp Video 2026-10-29 at 9.10.13 PM.mp4';
const output = path.resolve('public/videos/asmaraty-hero-banner.mp4');

if (!fs.existsSync(src)) {
  console.error('Source video not found:', src);
  process.exit(1);
}

const filter = [
  // Shot 1: Wide Bow Approach (0.0s to 3.8s)
  '[0:v]trim=0:3.8,setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,eq=brightness=0.03:contrast=1.06:saturation=1.16[shot1];',

  // Shot 2: Dynamic Bow & Water Spray Close-Up (1.5s to 4.5s -> 3.0s)
  '[0:v]trim=1.5:4.5,setpts=PTS-STARTPTS,crop=2100:1181:1450:600,scale=1920:1080,setsar=1,fps=30,eq=brightness=0.03:contrast=1.06:saturation=1.16[shot2];',

  // Shot 3: Flybridge & Solar Hardtop Showcase (3.0s to 6.2s -> 3.2s)
  '[0:v]trim=3.0:6.2,setpts=PTS-STARTPTS,crop=2200:1238:700:200,scale=1920:1080,setsar=1,fps=30,eq=brightness=0.03:contrast=1.06:saturation=1.16[shot3];',

  // Shot 4: Hull Profile & Teardrop Windows Waterline Glide (3.5s to 6.8s -> 3.3s)
  '[0:v]trim=3.5:6.8,setpts=PTS-STARTPTS,crop=2400:1350:600:500,scale=1920:1080,setsar=1,fps=30,eq=brightness=0.03:contrast=1.06:saturation=1.16[shot4];',

  // Shot 5: 60fps Broadcast Slow-Motion Beauty Glide (2.0s to 7.2s at ~0.55x speed -> 9.45s)
  '[0:v]trim=2.0:7.2,setpts=(1.818)*(PTS-STARTPTS),scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,eq=brightness=0.03:contrast=1.06:saturation=1.16[shot5];',

  // Crossfade transitions (duration 0.5s):
  // shot1 (3.8s) + shot2 (3.0s) @ offset 3.3s -> length = 3.3 + 3.0 = 6.3s
  '[shot1][shot2]xfade=transition=fade:duration=0.5:offset=3.3[t1];',

  // t1 (6.3s) + shot3 (3.2s) @ offset 5.8s -> length = 5.8 + 3.2 = 9.0s
  '[t1][shot3]xfade=transition=fade:duration=0.5:offset=5.8[t2];',

  // t2 (9.0s) + shot4 (3.3s) @ offset 8.5s -> length = 8.5 + 3.3 = 11.8s
  '[t2][shot4]xfade=transition=fade:duration=0.5:offset=8.5[t3];',

  // t3 (11.8s) + shot5 (9.45s) @ offset 11.3s -> length = 11.3 + 9.45 = 20.75s
  '[t3][shot5]xfade=transition=fade:duration=0.5:offset=11.3[t4];',

  // Seamless loop crossfade: blend last 0.5s into the start
  '[t4]split=2[loop_main][loop_tail];',
  '[loop_main]trim=0:20.25,setpts=PTS-STARTPTS[v_main];',
  '[loop_tail]trim=20.25:20.75,setpts=PTS-STARTPTS[v_tail];',
  '[v_tail][v_main]xfade=transition=fade:duration=0.5:offset=0.0[v_final]'
].join('');

console.log('Rendering exclusive 20-second G77 yacht sailing showcase...');
const start = Date.now();
const res = spawnSync(ffmpeg, [
  '-i', src,
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
  console.log(`Success! Created ${output} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
} else {
  console.error('Render error:', res.stderr.slice(-800));
}
