import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2020",
    rollupOptions: {
      input: {
        index: "index.html",
        app: "app.html",
        premium: "premium.html",
        podpora: "podpora.html",
        privacy: "privacy.html",
        deleteAccount: "delete-account.html",
        emailVerified: "email-verified/index.html",
        resetPassword: "reset-password/index.html",
      },
    },
  },
});
