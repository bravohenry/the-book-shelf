import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync } from 'fs';

// 插件：复制 manifest.json 到 dist 目录
const copyManifestPlugin = () => {
  return {
    name: 'copy-manifest',
    writeBundle() {
      const manifestPath = path.resolve(__dirname, 'manifest.json');
      const distManifestPath = path.resolve(__dirname, 'dist', 'manifest.json');
      if (existsSync(manifestPath)) {
        copyFileSync(manifestPath, distManifestPath);
        console.log('✓ Copied manifest.json to dist/');
      }
    },
  };
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        copyManifestPlugin(),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        rollupOptions: {
          input: {
            newtab: path.resolve(__dirname, 'newtab.html'),
          },
        },
        // 确保资源路径正确
        assetsDir: 'assets',
        // 内联小资源以减少请求
        assetsInlineLimit: 4096,
      },
      // 开发模式使用 index.html
      root: '.',
      // 确保公共资源正确复制
      publicDir: 'public',
    };
});
