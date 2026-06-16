import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "public/icons/app-icon.svg"));

const outputs = [
  ["public/icons/icon-192.png", 192],
  ["public/icons/icon-512.png", 512],
  ["public/icons/apple-touch-icon.png", 180],
  ["app/icon.png", 32],
  ["app/apple-icon.png", 180],
];

for (const [relativePath, size] of outputs) {
  const out = join(root, relativePath);
  await sharp(svg).resize(size, size).png().toFile(out);
  console.log(`wrote ${relativePath} (${size}x${size})`);
}
