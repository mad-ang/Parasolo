import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    // vite config
    plugins: [
      react({
        jsxRuntime: 'classic',
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: [['@emotion/babel-plugin']],
        },
      }),
    ],
    port: 5173,
    define: {
      __APP_ENV__: env.APP_ENV,
    },
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
        './runtimeConfig': './runtimeConfig.browser',
      },
    },
  };
});
