// https://nuxt.com/docs/api/configuration/nuxt-config
const isDev = process.env.NODE_ENV !== 'production'
const n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  devServer: {
    port: 5000
  },
  runtimeConfig: {
    public: {
      n8nBaseUrl: n8nBaseUrl,
      mode: process.env.NODE_ENV || 'development'
    }
  },
  nitro: {
    routeRules: isDev ? {
      // Only use proxy in development (localhost)
      '/webhook/**': {
        proxy: `${n8nBaseUrl}/webhook/**`
      },
      '/webhook-test/**': {
        proxy: `${n8nBaseUrl}/webhook-test/**`
      }
    } : {
      // In production, no proxy - client connects directly to N8N
    }
  },
  compatibilityDate: '2025-11-23'
})
