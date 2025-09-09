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
                    <label class="form-label">Company Name</label>
                    <input
                      v-model="generalSettings.companyName"
                      type="text"
                      class="form-input"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <label class="form-label">Default Currency</label>
                    <select v-model="generalSettings.defaultCurrency" class="form-input">
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label class="form-label">Time Zone</label>
                    <select v-model="generalSettings.timeZone" class="form-input">
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>

                  <div>
                    <label class="form-label">Date Format</label>
                    <select v-model="generalSettings.dateFormat" class="form-input">
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div class="flex justify-end">
                    <button type="submit" class="btn-primary">
                      Save Changes
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

                  <div class="flex justify-end">
                    <button type="submit" class="btn-primary">
                      Save Changes
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
                  <div>
                    <label class="form-label">Current Password</label>
                    <input
                      v-model="securitySettings.currentPassword"
                      type="password"
                      class="form-input"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label class="form-label">New Password</label>
                    <input
                      v-model="securitySettings.newPassword"
                      type="password"
                      class="form-input"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label class="form-label">Confirm New Password</label>
                    <input
                      v-model="securitySettings.confirmPassword"
                      type="password"
                      class="form-input"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p class="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <input
                      v-model="securitySettings.twoFactor"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div class="flex justify-end">
                    <button type="submit" class="btn-primary">
                      Save Changes
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

const generalSettings = ref({
  companyName: 'CRM Leads AI',
  defaultCurrency: 'USD',
  timeZone: 'UTC',
  dateFormat: 'MM/DD/YYYY'
})

const notificationSettings = ref({
  email: true,
  leadAssignment: true,
  followUpReminders: true,
  statusChanges: false
})

const securitySettings = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactor: false
})

const settingsTabs = ref([
  { id: 'general', name: 'General', icon: 'heroicons:cog-6-tooth' },
  { id: 'notifications', name: 'Notifications', icon: 'heroicons:bell' },
  { id: 'security', name: 'Security', icon: 'heroicons:shield-check' }
])

// Methods
const saveGeneralSettings = () => {
  // In a real app, this would save to the backend
  console.log('Saving general settings:', generalSettings.value)
  // Show success message
}

const saveNotificationSettings = () => {
  // In a real app, this would save to the backend
  console.log('Saving notification settings:', notificationSettings.value)
  // Show success message
}

const saveSecuritySettings = () => {
  // In a real app, this would save to the backend
  console.log('Saving security settings:', securitySettings.value)
  // Show success message
}

// Meta
definePageMeta({
  layout: 'default',
  auth: true
})
</script>