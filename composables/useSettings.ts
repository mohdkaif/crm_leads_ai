// Settings composable for managing user preferences throughout the application
export const useSettings = () => {
  // Default settings configuration
  const defaultSettings = {
    general: {
      companyName: 'CRM Leads AI',
      defaultCurrency: 'USD',
      timeZone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      language: 'en',
      theme: 'light'
    },
    notifications: {
      email: true,
      leadAssignment: true,
      followUpReminders: true,
      statusChanges: false,
      weeklyReports: true,
      monthlyReports: false,
      systemUpdates: true,
      marketingEmails: false
    },
    security: {
      twoFactor: false
    }
  }

  // Reactive settings state
  const settings = ref({
    general: { ...defaultSettings.general },
    notifications: { ...defaultSettings.notifications },
    security: { ...defaultSettings.security }
  })

  // Loading state
  const loading = ref(false)

  // Get authentication token
  const getAuthToken = () => {
    const token = useCookie('auth-token')
    if (!token.value && process.client) {
      const localToken = localStorage.getItem('auth-token')
      if (localToken) {
        token.value = localToken
      }
    }
    return token.value
  }

  // Load all settings
  const loadSettings = async () => {
    try {
      loading.value = true
      const token = getAuthToken()
      if (!token) return

      // Load general settings
      const generalResponse = await $fetch('/api/settings/general', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (generalResponse.success) {
        settings.value.general = { ...defaultSettings.general, ...generalResponse.data }
      }

      // Load notification settings
      const notificationResponse = await $fetch('/api/settings/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (notificationResponse.success) {
        settings.value.notifications = { ...defaultSettings.notifications, ...notificationResponse.data }
      }

    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      loading.value = false
    }
  }

  // Get setting value with fallback to default
  const getSetting = (category: keyof typeof defaultSettings, key: string) => {
    return settings.value[category]?.[key] ?? defaultSettings[category][key]
  }

  // Get general setting
  const getGeneralSetting = (key: keyof typeof defaultSettings.general) => {
    return getSetting('general', key)
  }

  // Get notification setting
  const getNotificationSetting = (key: keyof typeof defaultSettings.notifications) => {
    return getSetting('notifications', key)
  }

  // Get security setting
  const getSecuritySetting = (key: keyof typeof defaultSettings.security) => {
    return getSetting('security', key)
  }

  // Format currency based on user's default currency
  const formatCurrency = (amount: number, currency?: string) => {
    const userCurrency = currency || getGeneralSetting('defaultCurrency')
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userCurrency,
      minimumFractionDigits: 2
    })
    return formatter.format(amount)
  }

  // Format date based on user's date format preference
  const formatDate = (date: Date | string, format?: string) => {
    const userFormat = format || getGeneralSetting('dateFormat')
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    switch (userFormat) {
      case 'DD/MM/YYYY':
        return dateObj.toLocaleDateString('en-GB')
      case 'YYYY-MM-DD':
        return dateObj.toISOString().split('T')[0]
      case 'MM/DD/YYYY':
      default:
        return dateObj.toLocaleDateString('en-US')
    }
  }

  // Format date and time based on user's timezone
  const formatDateTime = (date: Date | string, includeTime = true) => {
    const userTimezone = getGeneralSetting('timeZone')
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: userTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
    
    if (includeTime) {
      options.hour = '2-digit'
      options.minute = '2-digit'
      options.hour12 = true
    }
    
    return dateObj.toLocaleString('en-US', options)
  }

  // Get relative time (e.g., "2 hours ago")
  const getRelativeTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diff = now.getTime() - dateObj.getTime()
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  // Check if user should receive notification
  const shouldNotify = (type: keyof typeof defaultSettings.notifications) => {
    return getNotificationSetting(type)
  }

  // Get company name for display
  const getCompanyName = () => {
    return getGeneralSetting('companyName')
  }

  // Get theme for UI
  const getTheme = () => {
    return getGeneralSetting('theme')
  }

  // Get language for internationalization
  const getLanguage = () => {
    return getGeneralSetting('language')
  }

  // Apply theme to document
  const applyTheme = () => {
    if (process.client) {
      const theme = getTheme()
      const html = document.documentElement
      
      if (theme === 'dark') {
        html.classList.add('dark')
      } else if (theme === 'light') {
        html.classList.remove('dark')
      } else if (theme === 'auto') {
        // Auto theme based on system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          html.classList.add('dark')
        } else {
          html.classList.remove('dark')
        }
      }
    }
  }

  // Watch for theme changes and apply them
  watch(() => settings.value.general.theme, () => {
    applyTheme()
  })

  // Initialize settings on mount
  onMounted(async () => {
    await loadSettings()
    applyTheme()
  })

  return {
    // State
    settings: readonly(settings),
    loading: readonly(loading),
    
    // Methods
    loadSettings,
    getSetting,
    getGeneralSetting,
    getNotificationSetting,
    getSecuritySetting,
    
    // Utility functions
    formatCurrency,
    formatDate,
    formatDateTime,
    getRelativeTime,
    shouldNotify,
    getCompanyName,
    getTheme,
    getLanguage,
    applyTheme
  }
}
