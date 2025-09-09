// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-09-08',
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/google-fonts',
    '@nuxtjs/i18n',
    '@nuxtjs/device',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@vueuse/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  tailwindcss: {
    configPath: 'tailwind.config.js'
  },
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb+srv://kaif060695:VnZxLAtvGfuCXIIG@nodemongo.g2y6s7i.mongodb.net/crm_ai?retryWrites=true&w=majority&appName=nodeMongo',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    public: {
      apiBase: '/api'
    }
  },
  colorMode: {
    preference: 'system',
    fallback: 'light',
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },
  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700, 800, 900],
      'Poppins': [300, 400, 500, 600, 700, 800, 900]
    }
  },
  i18n: {
    locales: [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' }
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default'
  },
  sitemap: {
    hostname: process.env.SITE_URL || 'http://localhost:3000',
    gzip: true
  },
  robots: {
    UserAgent: '*',
    Allow: '/',
    Sitemap: '/sitemap.xml'
  }
})