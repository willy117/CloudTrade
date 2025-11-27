import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 載入環境變數 (用於本地開發 .env)
  // 在 GitHub Actions 中，Secrets 會直接透過 process.env 傳入
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // 設定為相對路徑 './'，確保在 GitHub Pages 子路徑下能正確讀取資源
    base: './',
    define: {
      // 在 Build 階段將 process.env 替換為實際字串
      // 加入 || '' 確保若變數未設定，會替換為空字串而非 undefined，避免語法錯誤
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY || ''),
      'process.env.VITE_FINNHUB_API_KEY': JSON.stringify(process.env.VITE_FINNHUB_API_KEY || env.VITE_FINNHUB_API_KEY || ''),
      'process.env.VITE_FIREBASE_CONFIG_STRING': JSON.stringify(process.env.VITE_FIREBASE_CONFIG_STRING || env.VITE_FIREBASE_CONFIG_STRING || ''),
      // 防止某些第三方庫引用 process.env.NODE_ENV 出錯
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});