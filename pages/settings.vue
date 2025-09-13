<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p class="text-gray-600">Configure your CRM system preferences</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Settings Navigation -->
        <div class="lg:col-span-1">
          <nav class="space-y-1">
            <button
              v-for="tab in settingsTabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              ]"
            >
              <Icon :name="tab.icon" class="w-4 h-4 mr-3 inline" />
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Settings Content -->
        <div class="lg:col-span-2">
          <!-- General Settings -->
          <div v-if="activeTab === 'general'" class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900">General Settings</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="saveGeneralSettings">
                <div class="space-y-6">
                  <div>
                    <label class="form-label">Company Name *</label>
                    <input
                      v-model="generalSettings.companyName"
                      type="text"
                      class="form-input"
                      :class="{ 'border-red-300': errors.general.companyName }"
                      placeholder="Enter company name"
                      required
                      @blur="validateGeneralField('companyName')"
                    />
                    <p v-if="errors.general.companyName" class="form-error">{{ errors.general.companyName }}</p>
                  </div>

                  <div>
                    <label class="form-label">Default Currency *</label>
                    <select 
                      v-model="generalSettings.defaultCurrency" 
                      class="form-input"
                      :class="{ 'border-red-300': errors.general.defaultCurrency }"
                      required
                      @change="validateGeneralField('defaultCurrency')"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                    </select>
                    <p v-if="errors.general.defaultCurrency" class="form-error">{{ errors.general.defaultCurrency }}</p>
                  </div>

                  <div>
                    <label class="form-label">Time Zone *</label>
                    <select 
                      v-model="generalSettings.timeZone" 
                      class="form-input"
                      :class="{ 'border-red-300': errors.general.timeZone }"
                      required
                      @change="validateGeneralField('timeZone')"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                    </select>
                    <p v-if="errors.general.timeZone" class="form-error">{{ errors.general.timeZone }}</p>
                  </div>

                  <div>
                    <label class="form-label">Date Format *</label>
                    <select 
                      v-model="generalSettings.dateFormat" 
                      class="form-input"
                      :class="{ 'border-red-300': errors.general.dateFormat }"
                      required
                      @change="validateGeneralField('dateFormat')"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (European Format)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
                    </select>
                    <p v-if="errors.general.dateFormat" class="form-error">{{ errors.general.dateFormat }}</p>
                  </div>

                  <div>
                    <label class="form-label">Language</label>
                    <select v-model="generalSettings.language" class="form-input">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label class="form-label">Theme</label>
                    <select v-model="generalSettings.theme" class="form-input">
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>

                  <!-- Error Messages -->
                  <div v-if="errors.general.general" class="bg-red-50 border border-red-200 rounded-md p-4">
                    <p class="text-sm text-red-600">{{ errors.general.general }}</p>
                  </div>

                  <!-- Success Message -->
                  <div v-if="successMessage.general" class="bg-green-50 border border-green-200 rounded-md p-4">
                    <p class="text-sm text-green-600">{{ successMessage.general }}</p>
                  </div>

                  <div class="flex justify-end">
                    <button 
                      type="submit" 
                      :disabled="loading.general || !isGeneralFormValid"
                      class="btn-primary"
                      :class="{ 'opacity-50 cursor-not-allowed': loading.general || !isGeneralFormValid }"
                    >
                      <Icon
                        v-if="loading.general"
                        name="heroicons:arrow-path"
                        class="w-4 h-4 mr-2 animate-spin"
                      />
                      {{ loading.general ? 'Saving...' : 'Save Changes' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- Notification Settings -->
          <div v-if="activeTab === 'notifications'" class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900">Notification Settings</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="saveNotificationSettings">
                <div class="space-y-6">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p class="text-sm text-gray-500">Receive email notifications for important events</p>
                    </div>
                    <input
                      v-model="notificationSettings.email"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Lead Assignments</h4>
                      <p class="text-sm text-gray-500">Get notified when new leads are assigned to you</p>
                    </div>
                    <input
                      v-model="notificationSettings.leadAssignment"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Follow-up Reminders</h4>
                      <p class="text-sm text-gray-500">Receive reminders for scheduled follow-ups</p>
                    </div>
                    <input
                      v-model="notificationSettings.followUpReminders"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Lead Status Changes</h4>
                      <p class="text-sm text-gray-500">Get notified when lead statuses are updated</p>
                    </div>
                    <input
                      v-model="notificationSettings.statusChanges"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Weekly Reports</h4>
                      <p class="text-sm text-gray-500">Receive weekly performance reports</p>
                    </div>
                    <input
                      v-model="notificationSettings.weeklyReports"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Monthly Reports</h4>
                      <p class="text-sm text-gray-500">Receive monthly performance reports</p>
                    </div>
                    <input
                      v-model="notificationSettings.monthlyReports"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">System Updates</h4>
                      <p class="text-sm text-gray-500">Get notified about system updates and maintenance</p>
                    </div>
                    <input
                      v-model="notificationSettings.systemUpdates"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Marketing Emails</h4>
                      <p class="text-sm text-gray-500">Receive marketing and promotional emails</p>
                    </div>
                    <input
                      v-model="notificationSettings.marketingEmails"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <!-- Error Messages -->
                  <div v-if="errors.notifications.general" class="bg-red-50 border border-red-200 rounded-md p-4">
                    <p class="text-sm text-red-600">{{ errors.notifications.general }}</p>
                  </div>

                  <!-- Success Message -->
                  <div v-if="successMessage.notifications" class="bg-green-50 border border-green-200 rounded-md p-4">
                    <p class="text-sm text-green-600">{{ successMessage.notifications }}</p>
                  </div>

                  <div class="flex justify-end">
                    <button 
                      type="submit" 
                      :disabled="loading.notifications"
                      class="btn-primary"
                      :class="{ 'opacity-50 cursor-not-allowed': loading.notifications }"
                    >
                      <Icon
                        v-if="loading.notifications"
                        name="heroicons:arrow-path"
                        class="w-4 h-4 mr-2 animate-spin"
                      />
                      {{ loading.notifications ? 'Saving...' : 'Save Changes' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- Security Settings -->
          <div v-if="activeTab === 'security'" class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900">Security Settings</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="saveSecuritySettings">
                <div class="space-y-6">
                  <!-- Password Change Section -->
                  <div class="border-b border-gray-200 pb-6">
                    <h4 class="text-md font-medium text-gray-900 mb-4">Change Password</h4>
                    
                    <div>
                      <label class="form-label">Current Password</label>
                      <input
                        v-model="securitySettings.currentPassword"
                        type="password"
                        class="form-input"
                        :class="{ 'border-red-300': errors.security.currentPassword }"
                        placeholder="Enter current password"
                        @blur="validateSecurityField('currentPassword')"
                      />
                      <p v-if="errors.security.currentPassword" class="form-error">{{ errors.security.currentPassword }}</p>
                    </div>

                    <div class="mt-4">
                      <label class="form-label">New Password</label>
                      <input
                        v-model="securitySettings.newPassword"
                        type="password"
                        class="form-input"
                        :class="{ 'border-red-300': errors.security.newPassword }"
                        placeholder="Enter new password"
                        @blur="validateSecurityField('newPassword')"
                      />
                      <p v-if="errors.security.newPassword" class="form-error">{{ errors.security.newPassword }}</p>
                      <p class="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
                    </div>

                    <div class="mt-4">
                      <label class="form-label">Confirm New Password</label>
                      <input
                        v-model="securitySettings.confirmPassword"
                        type="password"
                        class="form-input"
                        :class="{ 'border-red-300': errors.security.confirmPassword }"
                        placeholder="Confirm new password"
                        @blur="validateSecurityField('confirmPassword')"
                      />
                      <p v-if="errors.security.confirmPassword" class="form-error">{{ errors.security.confirmPassword }}</p>
                    </div>
                  </div>

                  <!-- Two-Factor Authentication Section -->
                  <div class="border-b border-gray-200 pb-6">
                    <h4 class="text-md font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
                    
                    <div class="flex items-center justify-between">
                      <div>
                        <h4 class="text-sm font-medium text-gray-900">Enable 2FA</h4>
                        <p class="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <input
                        v-model="securitySettings.twoFactor"
                        type="checkbox"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <!-- Session Management -->
                  <div>
                    <h4 class="text-md font-medium text-gray-900 mb-4">Session Management</h4>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <div class="flex">
                        <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-yellow-400 mr-2" />
                        <div>
                          <h4 class="text-sm font-medium text-yellow-800">Active Sessions</h4>
                          <p class="text-sm text-yellow-700 mt-1">
                            You are currently logged in from this device. 
                            <button type="button" class="text-yellow-800 underline hover:text-yellow-900">
                              View all sessions
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Error Messages -->
                  <div v-if="errors.security.general" class="bg-red-50 border border-red-200 rounded-md p-4">
                    <p class="text-sm text-red-600">{{ errors.security.general }}</p>
                  </div>

                  <!-- Success Message -->
                  <div v-if="successMessage.security" class="bg-green-50 border border-green-200 rounded-md p-4">
                    <p class="text-sm text-green-600">{{ successMessage.security }}</p>
                  </div>

                  <div class="flex justify-end">
                    <button 
                      type="submit" 
                      :disabled="loading.security || !isSecurityFormValid"
                      class="btn-primary"
                      :class="{ 'opacity-50 cursor-not-allowed': loading.security || !isSecurityFormValid }"
                    >
                      <Icon
                        v-if="loading.security"
                        name="heroicons:arrow-path"
                        class="w-4 h-4 mr-2 animate-spin"
                      />
                      {{ loading.security ? 'Saving...' : 'Save Changes' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Reactive data
const activeTab = ref('general')
const loading = ref({
  general: false,
  notifications: false,
  security: false
})

const generalSettings = ref({
  companyName: 'CRM Leads AI',
  defaultCurrency: 'USD',
  timeZone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  language: 'en',
  theme: 'light'
})

const notificationSettings = ref({
  email: true,
  leadAssignment: true,
  followUpReminders: true,
  statusChanges: false,
  weeklyReports: true,
  monthlyReports: false,
  systemUpdates: true,
  marketingEmails: false
})

const securitySettings = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactor: false
})

const errors = ref({
  general: {},
  notifications: {},
  security: {}
})

const successMessage = ref({
  general: '',
  notifications: '',
  security: ''
})

const settingsTabs = ref([
  { id: 'general', name: 'General', icon: 'heroicons:cog-6-tooth' },
  { id: 'notifications', name: 'Notifications', icon: 'heroicons:bell' },
  { id: 'security', name: 'Security', icon: 'heroicons:shield-check' }
])

// Computed properties
const isGeneralFormValid = computed(() => {
  return generalSettings.value.companyName && 
         generalSettings.value.defaultCurrency && 
         generalSettings.value.timeZone && 
         generalSettings.value.dateFormat &&
         !Object.keys(errors.value.general).length
})

const isSecurityFormValid = computed(() => {
  // If no password fields are filled, form is valid (for 2FA only)
  if (!securitySettings.value.currentPassword && 
      !securitySettings.value.newPassword && 
      !securitySettings.value.confirmPassword) {
    return true
  }
  
  // If password change is attempted, all fields must be valid
  return securitySettings.value.currentPassword && 
         securitySettings.value.newPassword && 
         securitySettings.value.confirmPassword &&
         securitySettings.value.newPassword === securitySettings.value.confirmPassword &&
         securitySettings.value.newPassword.length >= 8 &&
         !Object.keys(errors.value.security).length
})

// Validation functions
const validateGeneralField = (fieldName) => {
  const value = generalSettings.value[fieldName]
  delete errors.value.general[fieldName]

  switch (fieldName) {
    case 'companyName':
      if (!value || value.trim().length < 2) {
        errors.value.general[fieldName] = 'Company name must be at least 2 characters'
      }
      break
    case 'defaultCurrency':
      const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']
      if (!value || !validCurrencies.includes(value)) {
        errors.value.general[fieldName] = 'Please select a valid currency'
      }
      break
    case 'timeZone':
      const validTimeZones = [
        'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 
        'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo'
      ]
      if (!value || !validTimeZones.includes(value)) {
        errors.value.general[fieldName] = 'Please select a valid timezone'
      }
      break
    case 'dateFormat':
      const validDateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
      if (!value || !validDateFormats.includes(value)) {
        errors.value.general[fieldName] = 'Please select a valid date format'
      }
      break
  }
}

const validateSecurityField = (fieldName) => {
  const value = securitySettings.value[fieldName]
  delete errors.value.security[fieldName]

  switch (fieldName) {
    case 'currentPassword':
      if (securitySettings.value.newPassword && !value) {
        errors.value.security[fieldName] = 'Current password is required to change password'
      }
      break
    case 'newPassword':
      if (value && value.length < 8) {
        errors.value.security[fieldName] = 'Password must be at least 8 characters long'
      }
      break
    case 'confirmPassword':
      if (value && value !== securitySettings.value.newPassword) {
        errors.value.security[fieldName] = 'Passwords do not match'
      }
      break
  }
}

// API functions
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

const loadGeneralSettings = async () => {
  try {
    const token = getAuthToken()
    if (!token) return

    const response = await $fetch('/api/settings/general', {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (response.success) {
      generalSettings.value = { ...generalSettings.value, ...response.data }
    }
  } catch (error) {
    console.error('Error loading general settings:', error)
  }
}

const loadNotificationSettings = async () => {
  try {
    const token = getAuthToken()
    if (!token) return

    const response = await $fetch('/api/settings/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (response.success) {
      notificationSettings.value = { ...notificationSettings.value, ...response.data }
    }
  } catch (error) {
    console.error('Error loading notification settings:', error)
  }
}

const saveGeneralSettings = async () => {
  try {
    loading.value.general = true
    errors.value.general = {}
    successMessage.value.general = ''

    // Validate form
    validateGeneralField('companyName')
    validateGeneralField('defaultCurrency')
    validateGeneralField('timeZone')
    validateGeneralField('dateFormat')

    if (Object.keys(errors.value.general).length > 0) {
      return
    }

    const token = getAuthToken()
    if (!token) {
      errors.value.general.general = 'Authentication required. Please login again.'
      return
    }

    const response = await $fetch('/api/settings/general', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: generalSettings.value
    })

    if (response.success) {
      successMessage.value.general = response.message
      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value.general = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Error saving general settings:', error)
    errors.value.general.general = error.data?.message || 'An error occurred while saving settings'
  } finally {
    loading.value.general = false
  }
}

const saveNotificationSettings = async () => {
  try {
    loading.value.notifications = true
    errors.value.notifications = {}
    successMessage.value.notifications = ''

    const token = getAuthToken()
    if (!token) {
      errors.value.notifications.general = 'Authentication required. Please login again.'
      return
    }

    const response = await $fetch('/api/settings/notifications', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: notificationSettings.value
    })

    if (response.success) {
      successMessage.value.notifications = response.message
      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value.notifications = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Error saving notification settings:', error)
    errors.value.notifications.general = error.data?.message || 'An error occurred while saving settings'
  } finally {
    loading.value.notifications = false
  }
}

const saveSecuritySettings = async () => {
  try {
    loading.value.security = true
    errors.value.security = {}
    successMessage.value.security = ''

    // Validate form
    validateSecurityField('currentPassword')
    validateSecurityField('newPassword')
    validateSecurityField('confirmPassword')

    if (Object.keys(errors.value.security).length > 0) {
      return
    }

    const token = getAuthToken()
    if (!token) {
      errors.value.security.general = 'Authentication required. Please login again.'
      return
    }

    const response = await $fetch('/api/settings/security', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: securitySettings.value
    })

    if (response.success) {
      successMessage.value.security = response.message
      // Clear form if password was changed
      if (securitySettings.value.newPassword) {
        securitySettings.value.currentPassword = ''
        securitySettings.value.newPassword = ''
        securitySettings.value.confirmPassword = ''
      }
      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value.security = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Error saving security settings:', error)
    errors.value.security.general = error.data?.message || 'An error occurred while saving settings'
  } finally {
    loading.value.security = false
  }
}

// Load settings when component mounts
onMounted(async () => {
  await Promise.all([
    loadGeneralSettings(),
    loadNotificationSettings()
  ])
})

// Meta
definePageMeta({
  layout: 'default',
  auth: true
})
</script>