# 🎛️ Settings Mapping Guide

This guide shows how user settings are mapped and used throughout the CRM application with proper defaults.

## 📋 Settings Structure

### General Settings
```typescript
{
  companyName: string        // Used in: Layout header, page titles, exports
  defaultCurrency: string    // Used in: Lead values, analytics, reports
  timeZone: string          // Used in: Date/time formatting, scheduling
  dateFormat: string        // Used in: All date displays, forms
  language: string          // Used in: Internationalization (future)
  theme: string            // Used in: UI theme (light/dark/auto)
}
```

### Notification Settings
```typescript
{
  email: boolean            // Used in: Email notifications
  leadAssignment: boolean   // Used in: Lead assignment alerts
  followUpReminders: boolean // Used in: Follow-up scheduling
  statusChanges: boolean    // Used in: Status change notifications
  weeklyReports: boolean    // Used in: Weekly report generation
  monthlyReports: boolean   // Used in: Monthly report generation
  systemUpdates: boolean    // Used in: System update notifications
  marketingEmails: boolean  // Used in: Marketing email preferences
}
```

### Security Settings
```typescript
{
  twoFactor: boolean        // Used in: Authentication flow
}
```

## 🔧 Implementation Examples

### 1. Currency Formatting
**File: `pages/leads/index.vue`**
```vue
<template>
  <!-- Before: Hardcoded currency -->
  <p class="stat-value">${{ stats.totalValue.toLocaleString() }}</p>
  
  <!-- After: Using settings -->
  <p class="stat-value">{{ formatCurrency(stats.totalValue) }}</p>
</template>

<script setup>
const { formatCurrency } = useSettings()
</script>
```

**File: `composables/useSettings.ts`**
```typescript
const formatCurrency = (amount: number, currency?: string) => {
  const userCurrency = currency || getGeneralSetting('defaultCurrency')
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: userCurrency,
    minimumFractionDigits: 2
  })
  return formatter.format(amount)
}
```

### 2. Date Formatting
**File: `pages/leads/index.vue`**
```vue
<template>
  <!-- Before: Basic date formatting -->
  <div class="text-sm text-gray-900">{{ formatDate(lead.createdAt) }}</div>
  
  <!-- After: Using user's date format preference -->
  <div class="text-sm text-gray-900">{{ formatDate(lead.createdAt) }}</div>
</template>

<script setup>
const { formatDate, getRelativeTime } = useSettings()
</script>
```

**File: `composables/useSettings.ts`**
```typescript
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
```

### 3. Company Name Display
**File: `layouts/default.vue`**
```vue
<template>
  <!-- Before: Hardcoded company name -->
  <h1 class="text-xl font-bold text-gradient">CRM Leads AI</h1>
  
  <!-- After: Using user's company name -->
  <h1 class="text-xl font-bold text-gradient">{{ getCompanyName() }}</h1>
</template>

<script setup>
const { getCompanyName } = useSettings()
</script>
```

### 4. Timezone-Aware DateTime
**File: `composables/useSettings.ts`**
```typescript
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
```

### 5. Notification Preferences
**File: `composables/useSettings.ts`**
```typescript
const shouldNotify = (type: keyof typeof defaultSettings.notifications) => {
  return getNotificationSetting(type)
}

// Usage in components
if (shouldNotify('leadAssignment')) {
  // Send lead assignment notification
}
```

## 🗄️ Database Integration

### User Model Schema
**File: `server/models/User.ts`**
```typescript
settings: {
  general: {
    companyName: { type: String, default: 'CRM Leads AI' },
    defaultCurrency: { type: String, default: 'USD' },
    timeZone: { type: String, default: 'UTC' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'light' }
  },
  notifications: {
    email: { type: Boolean, default: true },
    leadAssignment: { type: Boolean, default: true },
    followUpReminders: { type: Boolean, default: true },
    statusChanges: { type: Boolean, default: false },
    weeklyReports: { type: Boolean, default: true },
    monthlyReports: { type: Boolean, default: false },
    systemUpdates: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false }
  },
  security: {
    twoFactor: { type: Boolean, default: false }
  }
}
```

### API Endpoints
**File: `server/api/settings/general.get.ts`**
```typescript
const defaultSettings = {
  companyName: 'CRM Leads AI',
  defaultCurrency: 'USD',
  timeZone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  language: 'en',
  theme: 'light'
}

const settings = userData?.settings?.general || defaultSettings
```

## 🎯 Usage Patterns

### 1. Component Integration
```vue
<script setup>
// Import settings composable
const { 
  formatCurrency, 
  formatDate, 
  getCompanyName,
  shouldNotify 
} = useSettings()

// Use in template
</script>

<template>
  <div>
    <h1>{{ getCompanyName() }}</h1>
    <p>Value: {{ formatCurrency(lead.value) }}</p>
    <p>Created: {{ formatDate(lead.createdAt) }}</p>
  </div>
</template>
```

### 2. Default Value Handling
```typescript
// Always provide defaults
const getSetting = (category: keyof typeof defaultSettings, key: string) => {
  return settings.value[category]?.[key] ?? defaultSettings[category][key]
}

// Usage ensures no undefined values
const currency = getGeneralSetting('defaultCurrency') // Always returns a value
```

### 3. Settings Loading
```typescript
// Load settings on component mount
onMounted(async () => {
  await loadSettings()
  applyTheme() // Apply theme immediately
})

// Watch for changes
watch(() => settings.value.general.theme, () => {
  applyTheme()
})
```

## 🔄 Data Flow

1. **User Updates Settings** → Settings page form submission
2. **API Call** → `PUT /api/settings/general` with validation
3. **Database Update** → User document updated with new settings
4. **Frontend Update** → Settings composable state updated
5. **UI Re-render** → All components using settings automatically update
6. **Persistence** → Settings saved and loaded on subsequent visits

## 🎨 Theme Implementation

**File: `composables/useSettings.ts`**
```typescript
const applyTheme = () => {
  if (process.client) {
    const theme = getTheme()
    const html = document.documentElement
    
    if (theme === 'dark') {
      html.classList.add('dark')
    } else if (theme === 'light') {
      html.classList.remove('dark')
    } else if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }
  }
}
```

## 📊 Analytics Integration

**File: `pages/analytics.vue`**
```vue
<script setup>
const { formatCurrency, formatDate } = useSettings()

// Use settings for consistent formatting
const formatRevenue = (amount) => formatCurrency(amount)
const formatChartDate = (date) => formatDate(date)
</script>
```

## 🔔 Notification System

**File: `composables/useNotifications.ts`**
```typescript
const sendNotification = (type, data) => {
  if (shouldNotify(type)) {
    // Send notification
    console.log(`Sending ${type} notification:`, data)
  }
}

// Usage
sendNotification('leadAssignment', { leadId, assignee })
sendNotification('followUpReminders', { leadId, followUpDate })
```

## ✅ Benefits

1. **Consistent Formatting** - All currency, dates, and text use user preferences
2. **Default Fallbacks** - Never shows undefined or broken values
3. **Real-time Updates** - Changes apply immediately across the app
4. **Type Safety** - TypeScript ensures correct usage
5. **Performance** - Cached settings with reactive updates
6. **User Experience** - Personalized interface based on preferences

## 🚀 Future Enhancements

1. **Internationalization** - Language settings for multi-language support
2. **Advanced Themes** - Custom color schemes and layouts
3. **Notification Channels** - Email, SMS, push notification preferences
4. **Regional Settings** - Locale-specific formatting and conventions
5. **Team Settings** - Organization-wide default settings
6. **Settings Import/Export** - Backup and restore user preferences

This mapping system ensures that user settings are consistently applied throughout the application while maintaining proper defaults and type safety.
