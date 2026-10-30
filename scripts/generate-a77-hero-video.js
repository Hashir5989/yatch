const ffmpeg = require('ffmpeg-static');
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Creates the clean, 100% authentic, uncropped real G77 yacht sailing video
 * directly from the 4K 60fps master footage (WhatsApp Video 2026-10-29 at 9.10.13 PM.mp4).
 * 
 * - Full wide angle, completely uncropped
 * - Entire G77 yacht visible sailing on the open sea
 * - No AI generation, no zoom, 100% authentic client footage
 * - Seamless loop transition for the home hero banner
 */

const src = 'C:/Users/Hashir/Downloads/WhatsApp Video 2026-10-29 at 9.10.13 PM.mp4';
const output = path.resolve('public/videos/asmaraty-hero-banner.mp4');

if (!fs.existsSync(src)) {
  console.error('Source video not found:', src);
  process.exit(1);
}

// Total source is 7.32s at 60fps.
// We take 0.0s to 7.0s, scale directly to 1920x1080 with zero crop,
// and crossfade the last 0.5s into the beginning for an endless, seamless loop!
const filter = [
  '[0:v]trim=0:7.0,setpts=PTS-STARTPTS,scale=1920:1080,setsar=1,fps=30,eq=brightness=0.03:contrast=1.05:saturation=1.12[v_base];',
  '[v_base]split=2[loop_main][loop_tail];',
  '[loop_main]trim=0:6.5,setpts=PTS-STARTPTS[v_start];',
  '[loop_tail]trim=6.5:7.0,setpts=PTS-STARTPTS[v_end];',
  '[v_end][v_start]xfade=transition=fade:duration=0.5:offset=0.0[v_final]'
].join('');

console.log('Rendering pure uncropped real G77 sailing video...');
const start = Date.now();
const res = spawnSync(ffmpeg, [
  '-i', src,
  '-filter_complex', filter,
  '-map', '[v_final]',
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-crf', '19',
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
