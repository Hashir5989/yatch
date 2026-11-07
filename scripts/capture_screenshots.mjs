import fs from "fs";
import path from "path";
import os from "os";
import http from "http";
import { spawn, execFileSync } from "child_process";

const ARTIFACTS_DIR = "C:\\Users\\Hashir\\.gemini\\antigravity\\brain\\62dccab8-1706-4bf2-96bc-ba59ac65d65d\\screenshots";
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 3008;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const PAGES_TO_CAPTURE = [
  { slug: "home", path: "/", label: "Home Page" },
  { slug: "about", path: "/about", label: "About Us Page" },
  { slug: "catalog", path: "/yachts", label: "Fleet Catalog Page" },
  { slug: "g100", path: "/yachts/g100", label: "G100 Superyacht Detail" },
  { slug: "g77", path: "/yachts/g77", label: "G77 Luxury Yacht Detail" },
  { slug: "g66", path: "/yachts/g66", label: "G66 Flybridge Detail" },
  { slug: "g50", path: "/yachts/g50", label: "G50 Motor Yacht Detail" }
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 }
];

function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode && res.statusCode < 500) {
          resolve(true);
        } else {
          retry();
        }
      }).on("error", () => {
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`));
      } else {
        setTimeout(check, 500);
      }
    };

    check();
  });
}

async function captureScreenshot(url, outputPath, width, height) {
  const tempProfile = path.join(os.tmpdir(), `chrome-profile-${Date.now()}-${Math.random().toString(36).substring(2)}`);
  try {
    const args = [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1",
      "--mute-audio",
      "--disable-audio-output",
      `--user-data-dir=${tempProfile}`,
      `--window-size=${width},${height}`,
      "--hide-scrollbars",
      `--screenshot=${outputPath}`,
      url
    ];

    execFileSync(CHROME_PATH, args, { stdio: "ignore", timeout: 20000 });
    return fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0;
  } catch (err) {
    console.warn(`Failed to capture ${url} at ${width}x${height}:`, err.message);
    return false;
  } finally {
    try {
      if (fs.existsSync(tempProfile)) {
        fs.rmSync(tempProfile, { recursive: true, force: true });
      }
    } catch (_) {}
  }
}

async function main() {
  console.log("==================================================================");
  console.log("  PHASE 4: VISUAL SCREENSHOT VERIFICATION HARNESS");
  console.log("==================================================================");
  console.log(`Starting Next.js production server on port ${PORT}...`);

  const nextProcess = spawn("node", ["node_modules/next/dist/bin/next", "start", "-p", String(PORT), "-H", "127.0.0.1"], {
    stdio: "inherit",
    env: { ...process.env, PORT: String(PORT), NODE_ENV: "production" }
  });

  try {
    console.log("Waiting for server to become responsive...");
    await waitForServer(`${BASE_URL}/`);
    console.log("Server is ready and accepting requests!\n");

    const results = [];

    for (const page of PAGES_TO_CAPTURE) {
      console.log(`--- Capturing: ${page.label} (${page.path}) ---`);
      for (const vp of VIEWPORTS) {
        const filename = `${page.slug}-${vp.name}.png`;
        const outPath = path.join(ARTIFACTS_DIR, filename);
        const url = `${BASE_URL}${page.path}`;
        process.stdout.write(`  [${vp.name.toUpperCase()} ${vp.width}x${vp.height}] Capturing to ${filename}... `);

        if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
          const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
          console.log(`ALREADY CAPTURED (${sizeKb} KB)`);
          results.push({ page: page.label, viewport: vp.name, path: outPath, success: true, sizeKb });
          continue;
        }

        const ok = await captureScreenshot(url, outPath, vp.width, vp.height);
        if (ok) {
          const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
          console.log(`OK (${sizeKb} KB)`);
          results.push({ page: page.label, viewport: vp.name, path: outPath, success: true, sizeKb });
        } else {
          console.log(`FAILED`);
          results.push({ page: page.label, viewport: vp.name, path: outPath, success: false });
        }
      }
    }

    console.log("\n==================================================================");
    console.log("  SCREENSHOT CAPTURE SUMMARY");
    console.log("==================================================================");
    const passed = results.filter(r => r.success).length;
    console.log(`Successfully captured: ${passed} / ${results.length} screenshots.`);
    console.log(`Screenshots directory: ${ARTIFACTS_DIR}`);

  } finally {
    console.log("\nStopping Next.js server...");
    nextProcess.kill("SIGTERM");
    try {
      process.kill(nextProcess.pid);
    } catch (_) {}
  }
}

main().catch(err => {
  console.error("Visual capture error:", err);
  process.exit(1);
});

