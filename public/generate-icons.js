// 使用 Canvas API 生成图标（需要 Node.js 环境）
// 或者我们可以创建一个简单的 HTML 页面来生成图标

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建 SVG 内容
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="${size}" height="${size}" rx="${size * 0.16}" fill="#cdbba7"/>
  
  <!-- 书架 -->
  <rect x="${size * 0.16}" y="${size * 0.625}" width="${size * 0.69}" height="${size * 0.063}" fill="#b5a493"/>
  <rect x="${size * 0.16}" y="${size * 0.39}" width="${size * 0.69}" height="${size * 0.063}" fill="#b5a493"/>
  <rect x="${size * 0.16}" y="${size * 0.156}" width="${size * 0.69}" height="${size * 0.063}" fill="#b5a493"/>
  
  <!-- 书籍 - 第一层 -->
  <rect x="${size * 0.195}" y="${size * 0.172}" width="${size * 0.094}" height="${size * 0.203}" fill="#e8dff5" rx="${size * 0.008}"/>
  <rect x="${size * 0.313}" y="${size * 0.172}" width="${size * 0.094}" height="${size * 0.203}" fill="#fce1e4" rx="${size * 0.008}"/>
  <rect x="${size * 0.43}" y="${size * 0.172}" width="${size * 0.094}" height="${size * 0.203}" fill="#fcf4dd" rx="${size * 0.008}"/>
  <rect x="${size * 0.547}" y="${size * 0.172}" width="${size * 0.094}" height="${size * 0.203}" fill="#ddedea" rx="${size * 0.008}"/>
  <rect x="${size * 0.664}" y="${size * 0.172}" width="${size * 0.094}" height="${size * 0.203}" fill="#daeaf6" rx="${size * 0.008}"/>
  
  <!-- 书籍 - 第二层 -->
  <rect x="${size * 0.195}" y="${size * 0.406}" width="${size * 0.094}" height="${size * 0.203}" fill="#fff1e6" rx="${size * 0.008}"/>
  <rect x="${size * 0.313}" y="${size * 0.406}" width="${size * 0.094}" height="${size * 0.203}" fill="#fad2e1" rx="${size * 0.008}"/>
  <rect x="${size * 0.43}" y="${size * 0.406}" width="${size * 0.094}" height="${size * 0.203}" fill="#c5dedd" rx="${size * 0.008}"/>
  <rect x="${size * 0.547}" y="${size * 0.406}" width="${size * 0.094}" height="${size * 0.203}" fill="#dbe7e4" rx="${size * 0.008}"/>
  <rect x="${size * 0.664}" y="${size * 0.406}" width="${size * 0.094}" height="${size * 0.203}" fill="#f0efeb" rx="${size * 0.008}"/>
  
  <!-- 书籍 - 第三层 -->
  <rect x="${size * 0.195}" y="${size * 0.641}" width="${size * 0.094}" height="${size * 0.203}" fill="#eddcd2" rx="${size * 0.008}"/>
  <rect x="${size * 0.313}" y="${size * 0.641}" width="${size * 0.094}" height="${size * 0.203}" fill="#a8e6cf" rx="${size * 0.008}"/>
  <rect x="${size * 0.43}" y="${size * 0.641}" width="${size * 0.094}" height="${size * 0.203}" fill="#e8dff5" rx="${size * 0.008}"/>
  <rect x="${size * 0.547}" y="${size * 0.641}" width="${size * 0.094}" height="${size * 0.203}" fill="#fce1e4" rx="${size * 0.008}"/>
  <rect x="${size * 0.664}" y="${size * 0.641}" width="${size * 0.094}" height="${size * 0.203}" fill="#fcf4dd" rx="${size * 0.008}"/>
</svg>`;

// 生成不同尺寸的 SVG
[16, 48, 128].forEach(size => {
  const svg = createSVG(size);
  fs.writeFileSync(path.join(__dirname, `icon-${size}.svg`), svg);
  console.log(`✓ 生成 icon-${size}.svg`);
});

console.log('\n提示：SVG 文件已生成。你可以：');
console.log('1. 使用在线工具将 SVG 转换为 PNG（如 https://cloudconvert.com/svg-to-png）');
console.log('2. 使用设计软件（如 Figma、Sketch）打开 SVG 并导出为 PNG');
console.log('3. 或者直接使用 SVG 作为图标（需要修改 manifest.json）');

