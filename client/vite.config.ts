import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {nodePolyfills} from "vite-plugin-node-polyfills";

// https://vite.dev/config/

process.env.VITE_APP_VERSION = require('./package.json').version

export default defineConfig({
    plugins: [
        nodePolyfills({
            include: ['util', 'buffer', 'stream', 'crypto'],
            // Whether to polyfill specific globals.
            globals: {
                Buffer: true, // can also be 'build', 'dev', or false
                global: true,
                process: true,
            }
        }),
        vue()
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler' // or "modern"
            }
        }
    }
})
