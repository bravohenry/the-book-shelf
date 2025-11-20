// 将图片转换为 Chrome 扩展所需的图标尺寸
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从命令行参数获取图片路径，或使用默认路径
const inputImage = process.argv[2] || path.join(__dirname, 'icon-source.png');

if (!fs.existsSync(inputImage)) {
  console.error(`❌ 错误：找不到图片文件 "${inputImage}"`);
  console.log('\n使用方法：');
  console.log('  node convert-icon.js <图片路径>');
  console.log('\n或者将图片命名为 icon-source.png 放在 public 目录下');
  process.exit(1);
}

const sizes = [16, 48, 128];

console.log(`📸 正在处理图片: ${inputImage}\n`);

async function convertIcons() {
  try {
    for (const size of sizes) {
      const outputPath = path.join(__dirname, `icon-${size}.png`);
      
      await sharp(inputImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // 透明背景
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ 生成 icon-${size}.png (${size}x${size})`);
    }
    
    console.log('\n✅ 所有图标已生成！');
    console.log('现在可以运行 npm run build:extension 来重新构建扩展');
  } catch (error) {
    console.error('❌ 转换失败:', error.message);
    process.exit(1);
  }
}

convertIcons();

