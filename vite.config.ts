import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'; // Pastikan Anda juga mengimpor react jika belum ada

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    // TAMBAHKAN BAGIAN INI UNTUK GITHUB PAGES
    base: '/lexicon-legends/', 

    // Bagian yang sudah ada sebelumnya (tetap dipertahankan)
    plugins: [react()], // Tambahkan plugin react di sini
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY), // Saya asumsikan ini yang Anda maksud
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // Arahkan '@' ke folder src Anda
      }
    }
  };
});