<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p class="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Sidebar -->
        <div class="lg:col-span-1">
          <div class="card">
            <div class="card-body text-center">
              <div class="flex justify-center mb-4">
                <div class="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                  <span class="text-2xl font-medium text-gray-700">
                    {{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}
                  </span>
                </div>
              </div>
              <h3 class="text-lg font-medium text-gray-900">
                {{ user?.firstName }} {{ user?.lastName }}
              </h3>
              <p class="text-sm text-gray-500">{{ user?.email }}</p>
              <div class="mt-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getRoleBadgeClass(user?.role)">
                  {{ user?.role }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="card mt-6">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900">Quick Stats</h3>
            </div>
            <div class="card-body">
              <div class="space-y-4">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Leads Created</span>
                  <span class="text-sm font-medium text-gray-900">{{ stats.leadsCreated || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Activities Completed</span>
                  <span class="text-sm font-medium text-gray-900">{{ stats.activitiesCompleted || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Last Login</span>
                  <span class="text-sm font-medium text-gray-900">{{ formatDate(user?.lastLogin) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Content -->
        <div class="lg:col-span-2">
          <!-- Personal Information -->
          <div class="card mb-6">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="updateProfile">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="form-label">First Name</label>
                    <input
                      v-model="profileData.firstName"
                      type="text"
                      class="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label class="form-label">Last Name</label>
                    <input
                      v-model="profileData.lastName"
                      type="text"
                      class="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label class="form-label">Email</label>
                    <input
                      v-model="profileData.email"
                      type="email"
                      class="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label class="form-label">Phone</label>
                    <input
                      v-model="profileData.phone"
                      type="tel"
                      class="form-input"
                    />
                  </div>

                  <div>
                    <label class="form-label">Department</label>
                    <input
                      v-model="profileData.department"
                      type="text"
                      class="form-input"
                    />
                  </div>

                  <div>
                    <label class="form-label">Job Title</label>
                    <input
                      v-model="profileData.jobTitle"
                      type="text"
                      class="form-input"
                    />
                  </div>
                </div>

                <div class="mt-6">
                  <label class="form-label">Bio</label>
                  <textarea
                    v-model="profileData.bio"
                    rows="3"
                    class="form-input"
                    placeholder="Tell us about yourself..."
                  ></textarea>
                </div>

                <div class="flex justify-end mt-6">
                  <button type="submit" class="btn-primary" :disabled="loading">
                    <Icon v-if="loading" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
                    {{ loading ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Change Password -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900">Change Password</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="changePassword">
                <div class="space-y-6">
                  <div>
                    <label class="form-label">Current Password</label>
                    <input
                      v-model="passwordData.currentPassword"
                      type="password"
                      class="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label class="form-label">New Password</label>
                    <input
                      v-model="passwordData.newPassword"
                      type="password"
                      class="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label class="form-label">Confirm New Password</label>
                    <input
                      v-model="passwordData.confirmPassword"
                      type="password"
                      class="form-input"
                      required
                    />
                  </div>

                  <div class="flex justify-end">
                    <button type="submit" class="btn-primary" :disabled="passwordLoading">
                      <Icon v-if="passwordLoading" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
                      {{ passwordLoading ? 'Changing...' : 'Change Password' }}
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
const loading = ref(false)
const passwordLoading = ref(false)
const user = ref(null)
const stats = ref({ leadsCreated: 0, activitiesCompleted: 0 })

const profileData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  jobTitle: '',
  bio: ''
})

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Methods
const loadUser = async () => {
  try {
    const token = useCookie('auth-token')
    if (!token.value) {
      throw new Error('Authentication required')
    }

    const response = await $fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    if (response.success) {
      user.value = response.user
      profileData.value = {
        firstName: response.user.firstName || '',
        lastName: response.user.lastName || '',
        email: response.user.email || '',
        phone: response.user.phone || '',
        department: response.user.department || '',
        jobTitle: response.user.jobTitle || '',
        bio: response.user.bio || ''
      }
    }
  } catch (err) {
    console.error('Error loading user:', err)
  }
}

const updateProfile = async () => {
  try {
    loading.value = true
    
    const token = useCookie('auth-token')
    if (!token.value) {
      throw new Error('Authentication required')
    }

    const response = await $fetch('/api/users/me', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: profileData.value
    })
    
    if (response.success) {
      user.value = response.user
      // Show success message
    }
  } catch (err) {
    console.error('Error updating profile:', err)
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  try {
    passwordLoading.value = true
    
    if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
      throw new Error('Passwords do not match')
    }

    const token = useCookie('auth-token')
    if (!token.value) {
      throw new Error('Authentication required')
    }

    const response = await $fetch('/api/users/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: {
        currentPassword: passwordData.value.currentPassword,
        newPassword: passwordData.value.newPassword
      }
    })
    
    if (response.success) {
      // Clear password fields
      passwordData.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
      // Show success message
    }
  } catch (err) {
    console.error('Error changing password:', err)
  } finally {
    passwordLoading.value = false
  }
}

const getRoleBadgeClass = (role) => {
  const classes = {
    admin: 'bg-red-100 text-red-800',
    user: 'bg-green-100 text-green-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  loadUser()
})

// Meta
definePageMeta({
  layout: 'default',
  auth: true
})
</script>