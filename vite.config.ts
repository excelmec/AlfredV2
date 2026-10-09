import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Resolves the `baseUrl` imports (e.g. 'Hooks/...') and the `@/` alias from tsconfig.json
    tsconfigPaths: true,
  },
  // Keep the existing REACT_APP_* variable names so current .env files keep working
  envPrefix: 'REACT_APP_',
  server: { port: 3000 },
  build: { outDir: 'build' },
});
