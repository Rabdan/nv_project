// https://nuxt.com/docs/api/configuration/nuxt-config
const n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678'
const mode = process.env.MODE || 'development'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  devServer: {
    port: 5000
  },
  runtimeConfig: {
    public: {
      n8nBaseUrl,
      mode
    }
  },
  routeRules: {
    '/webhook/**': { proxy: `${n8nBaseUrl}/webhook/**` },
    '/webhook-test/**': { proxy: `${n8nBaseUrl}/webhook-test/**` }
  },
  compatibilityDate: '2025-11-23'
})
