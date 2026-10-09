import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  // Keep the existing REACT_APP_* variable names so current .env files keep working
  envPrefix: 'REACT_APP_',
  server: { port: 3000 },
  build: { outDir: 'build' },
});
