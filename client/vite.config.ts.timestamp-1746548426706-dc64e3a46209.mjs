var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// package.json
var require_package = __commonJS({
  "package.json"(exports, module) {
    module.exports = {
      name: "masterthesis-client",
      version: "0.21.0",
      private: true,
      type: "module",
      author: "Mat\u011Bj Cajthaml",
      license: "ISC",
      scripts: {
        dev: "vite",
        "local:dev": "vite --host 0.0.0.0 --port 5173",
        build: 'run-p type-check "build-only {@}" --',
        preview: "vite preview",
        "build-only": "vite build",
        "type-check": "vue-tsc --build --force",
        lint: "eslint . --fix",
        format: "prettier --write src/",
        "cy:open": "cypress open",
        "cy:run": "cypress run"
      },
      dependencies: {
        "@tiptap/core": "^2.11.2",
        "@tiptap/extension-color": "^2.11.2",
        "@tiptap/extension-font-family": "^2.11.2",
        "@tiptap/extension-subscript": "^2.11.2",
        "@tiptap/extension-superscript": "^2.11.2",
        "@tiptap/extension-text-align": "^2.11.2",
        "@tiptap/extension-text-style": "^2.11.2",
        "@tiptap/extension-underline": "^2.11.2",
        "@tiptap/pm": "^2.11.2",
        "@tiptap/starter-kit": "^2.11.2",
        "file-saver": "^2.0.5",
        "floating-vue": "^5.2.2",
        jsonwebtoken: "^9.0.2",
        jszip: "^3.10.1",
        marked: "^15.0.7",
        mermaid: "^11.4.1",
        moment: "^2.30.1",
        pinia: "^2.2.4",
        "qrcode.vue": "^3.6.0",
        "quickjs-emscripten": "^0.31.0",
        "reflect-metadata": "^0.2.2",
        "sanitize-html": "^2.14.0",
        sass: "^1.80.5",
        "socket.io-client": "^4.8.1",
        unhead: "^1.11.14",
        uuid: "^11.0.3",
        vue: "^3.5.12",
        "vue-router": "^4.4.5"
      },
      devDependencies: {
        "@tsconfig/node20": "^20.1.4",
        "@types/file-saver": "^2.0.7",
        "@types/jsonwebtoken": "^9.0.7",
        "@types/node": "^20.17.0",
        "@types/sanitize-html": "^2.13.0",
        "@vitejs/plugin-vue": "^5.1.4",
        "@vue/eslint-config-prettier": "^10.0.0",
        "@vue/eslint-config-typescript": "^14.1.1",
        "@vue/tsconfig": "^0.5.1",
        "class-transformer": "^0.5.1",
        "class-validator": "^0.14.1",
        cypress: "^14.2.0",
        eslint: "^9.13.0",
        "eslint-plugin-vue": "^9.29.0",
        "npm-run-all2": "^7.0.1",
        prettier: "^3.3.3",
        typescript: "~5.6.0",
        vite: "^5.4.10",
        "vite-plugin-checker": "^0.8.0",
        "vite-plugin-node-polyfills": "^0.22.0",
        "vue-tsc": "^2.1.6"
      }
    };
  }
});

// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///app/node_modules/vite/dist/node/index.js";
import vue from "file:///app/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { nodePolyfills } from "file:///app/node_modules/vite-plugin-node-polyfills/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///app/vite.config.ts";
process.env.VITE_APP_VERSION = require_package().version;
var vite_config_default = defineConfig({
  server: {
    watch: {
      usePolling: true
    }
  },
  plugins: [
    nodePolyfills({
      include: ["util", "buffer", "stream", "crypto"],
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true,
        // can also be 'build', 'dev', or false
        global: true,
        process: true
      }
    }),
    vue()
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler"
        // or "modern"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicGFja2FnZS5qc29uIiwgInZpdGUuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJ7XHJcbiAgICBcIm5hbWVcIjogXCJtYXN0ZXJ0aGVzaXMtY2xpZW50XCIsXHJcbiAgICBcInZlcnNpb25cIjogXCIwLjIxLjBcIixcclxuICAgIFwicHJpdmF0ZVwiOiB0cnVlLFxyXG4gICAgXCJ0eXBlXCI6IFwibW9kdWxlXCIsXHJcbiAgICBcImF1dGhvclwiOiBcIk1hdFx1MDExQmogQ2FqdGhhbWxcIixcclxuICAgIFwibGljZW5zZVwiOiBcIklTQ1wiLFxyXG4gICAgXCJzY3JpcHRzXCI6IHtcclxuICAgICAgICBcImRldlwiOiBcInZpdGVcIixcclxuICAgICAgICBcImxvY2FsOmRldlwiOiBcInZpdGUgLS1ob3N0IDAuMC4wLjAgLS1wb3J0IDUxNzNcIixcclxuICAgICAgICBcImJ1aWxkXCI6IFwicnVuLXAgdHlwZS1jaGVjayBcXFwiYnVpbGQtb25seSB7QH1cXFwiIC0tXCIsXHJcbiAgICAgICAgXCJwcmV2aWV3XCI6IFwidml0ZSBwcmV2aWV3XCIsXHJcbiAgICAgICAgXCJidWlsZC1vbmx5XCI6IFwidml0ZSBidWlsZFwiLFxyXG4gICAgICAgIFwidHlwZS1jaGVja1wiOiBcInZ1ZS10c2MgLS1idWlsZCAtLWZvcmNlXCIsXHJcbiAgICAgICAgXCJsaW50XCI6IFwiZXNsaW50IC4gLS1maXhcIixcclxuICAgICAgICBcImZvcm1hdFwiOiBcInByZXR0aWVyIC0td3JpdGUgc3JjL1wiLFxyXG4gICAgICAgIFwiY3k6b3BlblwiOiBcImN5cHJlc3Mgb3BlblwiLFxyXG4gICAgICAgIFwiY3k6cnVuXCI6IFwiY3lwcmVzcyBydW5cIlxyXG4gICAgfSxcclxuICAgIFwiZGVwZW5kZW5jaWVzXCI6IHtcclxuICAgICAgICBcIkB0aXB0YXAvY29yZVwiOiBcIl4yLjExLjJcIixcclxuICAgICAgICBcIkB0aXB0YXAvZXh0ZW5zaW9uLWNvbG9yXCI6IFwiXjIuMTEuMlwiLFxyXG4gICAgICAgIFwiQHRpcHRhcC9leHRlbnNpb24tZm9udC1mYW1pbHlcIjogXCJeMi4xMS4yXCIsXHJcbiAgICAgICAgXCJAdGlwdGFwL2V4dGVuc2lvbi1zdWJzY3JpcHRcIjogXCJeMi4xMS4yXCIsXHJcbiAgICAgICAgXCJAdGlwdGFwL2V4dGVuc2lvbi1zdXBlcnNjcmlwdFwiOiBcIl4yLjExLjJcIixcclxuICAgICAgICBcIkB0aXB0YXAvZXh0ZW5zaW9uLXRleHQtYWxpZ25cIjogXCJeMi4xMS4yXCIsXHJcbiAgICAgICAgXCJAdGlwdGFwL2V4dGVuc2lvbi10ZXh0LXN0eWxlXCI6IFwiXjIuMTEuMlwiLFxyXG4gICAgICAgIFwiQHRpcHRhcC9leHRlbnNpb24tdW5kZXJsaW5lXCI6IFwiXjIuMTEuMlwiLFxyXG4gICAgICAgIFwiQHRpcHRhcC9wbVwiOiBcIl4yLjExLjJcIixcclxuICAgICAgICBcIkB0aXB0YXAvc3RhcnRlci1raXRcIjogXCJeMi4xMS4yXCIsXHJcbiAgICAgICAgXCJmaWxlLXNhdmVyXCI6IFwiXjIuMC41XCIsXHJcbiAgICAgICAgXCJmbG9hdGluZy12dWVcIjogXCJeNS4yLjJcIixcclxuICAgICAgICBcImpzb253ZWJ0b2tlblwiOiBcIl45LjAuMlwiLFxyXG4gICAgICAgIFwianN6aXBcIjogXCJeMy4xMC4xXCIsXHJcbiAgICAgICAgXCJtYXJrZWRcIjogXCJeMTUuMC43XCIsXHJcbiAgICAgICAgXCJtZXJtYWlkXCI6IFwiXjExLjQuMVwiLFxyXG4gICAgICAgIFwibW9tZW50XCI6IFwiXjIuMzAuMVwiLFxyXG4gICAgICAgIFwicGluaWFcIjogXCJeMi4yLjRcIixcclxuICAgICAgICBcInFyY29kZS52dWVcIjogXCJeMy42LjBcIixcclxuICAgICAgICBcInF1aWNranMtZW1zY3JpcHRlblwiOiBcIl4wLjMxLjBcIixcclxuICAgICAgICBcInJlZmxlY3QtbWV0YWRhdGFcIjogXCJeMC4yLjJcIixcclxuICAgICAgICBcInNhbml0aXplLWh0bWxcIjogXCJeMi4xNC4wXCIsXHJcbiAgICAgICAgXCJzYXNzXCI6IFwiXjEuODAuNVwiLFxyXG4gICAgICAgIFwic29ja2V0LmlvLWNsaWVudFwiOiBcIl40LjguMVwiLFxyXG4gICAgICAgIFwidW5oZWFkXCI6IFwiXjEuMTEuMTRcIixcclxuICAgICAgICBcInV1aWRcIjogXCJeMTEuMC4zXCIsXHJcbiAgICAgICAgXCJ2dWVcIjogXCJeMy41LjEyXCIsXHJcbiAgICAgICAgXCJ2dWUtcm91dGVyXCI6IFwiXjQuNC41XCJcclxuICAgIH0sXHJcbiAgICBcImRldkRlcGVuZGVuY2llc1wiOiB7XHJcbiAgICAgICAgXCJAdHNjb25maWcvbm9kZTIwXCI6IFwiXjIwLjEuNFwiLFxyXG4gICAgICAgIFwiQHR5cGVzL2ZpbGUtc2F2ZXJcIjogXCJeMi4wLjdcIixcclxuICAgICAgICBcIkB0eXBlcy9qc29ud2VidG9rZW5cIjogXCJeOS4wLjdcIixcclxuICAgICAgICBcIkB0eXBlcy9ub2RlXCI6IFwiXjIwLjE3LjBcIixcclxuICAgICAgICBcIkB0eXBlcy9zYW5pdGl6ZS1odG1sXCI6IFwiXjIuMTMuMFwiLFxyXG4gICAgICAgIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI6IFwiXjUuMS40XCIsXHJcbiAgICAgICAgXCJAdnVlL2VzbGludC1jb25maWctcHJldHRpZXJcIjogXCJeMTAuMC4wXCIsXHJcbiAgICAgICAgXCJAdnVlL2VzbGludC1jb25maWctdHlwZXNjcmlwdFwiOiBcIl4xNC4xLjFcIixcclxuICAgICAgICBcIkB2dWUvdHNjb25maWdcIjogXCJeMC41LjFcIixcclxuICAgICAgICBcImNsYXNzLXRyYW5zZm9ybWVyXCI6IFwiXjAuNS4xXCIsXHJcbiAgICAgICAgXCJjbGFzcy12YWxpZGF0b3JcIjogXCJeMC4xNC4xXCIsXHJcbiAgICAgICAgXCJjeXByZXNzXCI6IFwiXjE0LjIuMFwiLFxyXG4gICAgICAgIFwiZXNsaW50XCI6IFwiXjkuMTMuMFwiLFxyXG4gICAgICAgIFwiZXNsaW50LXBsdWdpbi12dWVcIjogXCJeOS4yOS4wXCIsXHJcbiAgICAgICAgXCJucG0tcnVuLWFsbDJcIjogXCJeNy4wLjFcIixcclxuICAgICAgICBcInByZXR0aWVyXCI6IFwiXjMuMy4zXCIsXHJcbiAgICAgICAgXCJ0eXBlc2NyaXB0XCI6IFwifjUuNi4wXCIsXHJcbiAgICAgICAgXCJ2aXRlXCI6IFwiXjUuNC4xMFwiLFxyXG4gICAgICAgIFwidml0ZS1wbHVnaW4tY2hlY2tlclwiOiBcIl4wLjguMFwiLFxyXG4gICAgICAgIFwidml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHNcIjogXCJeMC4yMi4wXCIsXHJcbiAgICAgICAgXCJ2dWUtdHNjXCI6IFwiXjIuMS42XCJcclxuICAgIH1cclxufVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9hcHAvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2FwcC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7ZmlsZVVSTFRvUGF0aCwgVVJMfSBmcm9tICdub2RlOnVybCdcclxuXHJcbmltcG9ydCB7ZGVmaW5lQ29uZmlnfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcclxuaW1wb3J0IHtub2RlUG9seWZpbGxzfSBmcm9tIFwidml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHNcIjtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZS5kZXYvY29uZmlnL1xyXG5cclxucHJvY2Vzcy5lbnYuVklURV9BUFBfVkVSU0lPTiA9IHJlcXVpcmUoJy4vcGFja2FnZS5qc29uJykudmVyc2lvblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICAgIHdhdGNoOiB7XHJcbiAgICAgICAgICAgIHVzZVBvbGxpbmc6IHRydWUsXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgICBub2RlUG9seWZpbGxzKHtcclxuICAgICAgICAgICAgaW5jbHVkZTogWyd1dGlsJywgJ2J1ZmZlcicsICdzdHJlYW0nLCAnY3J5cHRvJ10sXHJcbiAgICAgICAgICAgIC8vIFdoZXRoZXIgdG8gcG9seWZpbGwgc3BlY2lmaWMgZ2xvYmFscy5cclxuICAgICAgICAgICAgZ2xvYmFsczoge1xyXG4gICAgICAgICAgICAgICAgQnVmZmVyOiB0cnVlLCAvLyBjYW4gYWxzbyBiZSAnYnVpbGQnLCAnZGV2Jywgb3IgZmFsc2VcclxuICAgICAgICAgICAgICAgIGdsb2JhbDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHByb2Nlc3M6IHRydWUsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KSxcclxuICAgICAgICB2dWUoKVxyXG4gICAgXSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgICBhbGlhczoge1xyXG4gICAgICAgICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBjc3M6IHtcclxuICAgICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIHNjc3M6IHtcclxuICAgICAgICAgICAgICAgIGFwaTogJ21vZGVybi1jb21waWxlcicgLy8gb3IgXCJtb2Rlcm5cIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUNJLE1BQVE7QUFBQSxNQUNSLFNBQVc7QUFBQSxNQUNYLFNBQVc7QUFBQSxNQUNYLE1BQVE7QUFBQSxNQUNSLFFBQVU7QUFBQSxNQUNWLFNB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
