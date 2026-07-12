import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svg = readFileSync(join(root, "public/icons/app-icon.svg"));

const sizes = [
  { size: 192, out: "public/icons/icon-192.png" },
  { size: 512, out: "public/icons/icon-512.png" },
  { size: 180, out: "app/apple-icon.png" },
  { size: 32,  out: "app/icon.png" },
];

for (const { size, out } of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(join(root, out));
  console.log(`✓ ${out} (${size}×${size})`);
}
