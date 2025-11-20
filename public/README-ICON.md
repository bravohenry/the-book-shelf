# 如何更换扩展图标

## 方法 1：使用转换脚本（推荐）

1. 将你的图片文件（PNG、JPG、SVG 等）放到 `public` 目录
2. 运行转换脚本：

```bash
# 如果图片名为 icon-source.png
node public/convert-icon.js

# 或者指定图片路径
node public/convert-icon.js /path/to/your/image.png
```

脚本会自动生成三个尺寸的图标：
- `icon-16.png` (16x16)
- `icon-48.png` (48x48)  
- `icon-128.png` (128x128)

3. 重新构建扩展：
```bash
npm run build:extension
```

## 方法 2：手动替换

直接替换 `public` 目录下的图标文件：
- `icon-16.png`
- `icon-48.png`
- `icon-128.png`

然后重新构建扩展。

## 图标要求

- 推荐尺寸：至少 128x128 像素
- 格式：PNG（支持透明背景）
- 建议：使用正方形图片，内容居中

