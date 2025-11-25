// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  devServer: {
    port: 5000
  },
  runtimeConfig: {
    public: {
      n8nBaseUrl: process.env.NUXT_PUBLIC_N8N_BASE_URL || 'http://localhost:5678',
      mode: process.env.NODE_ENV || 'development'
    }
  },
  nitro: {
    routeRules: {
      '/webhook/**': {
        proxy: `${process.env.NUXT_PUBLIC_N8N_BASE_URL || 'http://localhost:5678'}/webhook/**`
      },
      '/webhook-test/**': {
        proxy: `${process.env.NUXT_PUBLIC_N8N_BASE_URL || 'http://localhost:5678'}/webhook-test/**`
      }
    }
  },
  compatibilityDate: '2025-11-23'
})
