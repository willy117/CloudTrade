import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 載入環境變數 (用於本地開發)
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // 設定為相對路徑 './'，這樣無論 Repository 名稱是什麼，資源路徑都正確
    base: './',
    define: {
      // 在 Build 階段將 process.env 替換為實際字串，解決瀏覽器不支援 process 的問題
      // 注意：這裡必須顯式定義每一個要使用的變數，以確保安全性與正確替換
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY),
      'process.env.VITE_FINNHUB_API_KEY': JSON.stringify(process.env.VITE_FINNHUB_API_KEY || env.VITE_FINNHUB_API_KEY),
      'process.env.VITE_FIREBASE_CONFIG_STRING': JSON.stringify(process.env.VITE_FIREBASE_CONFIG_STRING || env.VITE_FIREBASE_CONFIG_STRING),
      // 防止某些第三方庫引用 process.env.NODE_ENV 出錯
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});