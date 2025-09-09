<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
            <p class="text-gray-600">Manage team members and their permissions</p>
          </div>
          <button @click="openAddModal" class="btn-primary">
            <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin text-blue-600" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- Users Content -->
      <div v-else>
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Icon name="heroicons:users" class="w-6 h-6" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Total Users</p>
                  <p class="text-2xl font-bold text-gray-900">{{ summary.total }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-full bg-green-100 text-green-600">
                  <Icon name="heroicons:check-circle" class="w-6 h-6" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Active</p>
                  <p class="text-2xl font-bold text-gray-900">{{ summary.active }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-full bg-red-100 text-red-600">
                  <Icon name="heroicons:x-circle" class="w-6 h-6" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Inactive</p>
                  <p class="text-2xl font-bold text-gray-900">{{ summary.inactive }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Icon name="heroicons:shield-check" class="w-6 h-6" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-600">Admins</p>
                  <p class="text-2xl font-bold text-gray-900">{{ summary.admins }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">All Users</h3>
          </div>
          <div class="card-body">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="user in filteredUsers" :key="user._id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span class="text-sm font-medium text-gray-700">
                              {{ user.firstName?.charAt(0) }}{{ user.lastName?.charAt(0) }}
                            </span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">
                            {{ user.firstName }} {{ user.lastName }}
                          </div>
                          <div class="text-sm text-gray-500">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="getRoleBadgeClass(user.role)">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="getStatusBadgeClass(user.status)">
                        {{ user.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(user.lastLogin) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <button @click="openEditModal(user)" class="text-blue-600 hover:text-blue-900" title="Edit User">
                          <Icon name="heroicons:pencil" class="w-4 h-4" />
                        </button>
                        <button @click="openDeleteModal(user)" class="text-red-600 hover:text-red-900" title="Delete User">
                          <Icon name="heroicons:trash" class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>
          
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <form @submit.prevent="saveUser">
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div class="w-full">
                    <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {{ isEditMode ? 'Edit User' : 'Add New User' }}
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="form-label">First Name *</label>
                        <input
                          v-model="userForm.firstName"
                          type="text"
                          class="form-input"
                          required
                        />
                      </div>
                      
                      <div>
                        <label class="form-label">Last Name *</label>
                        <input
                          v-model="userForm.lastName"
                          type="text"
                          class="form-input"
                          required
                        />
                      </div>
                      
                      <div>
                        <label class="form-label">Email *</label>
                        <input
                          v-model="userForm.email"
                          type="email"
                          class="form-input"
                          required
                        />
                      </div>
                      
                      <div>
                        <label class="form-label">Phone</label>
                        <input
                          v-model="userForm.phone"
                          type="tel"
                          class="form-input"
                        />
                      </div>
                      
                      <div>
                        <label class="form-label">Role *</label>
                        <select v-model="userForm.role" class="form-input" required>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      
                      <div>
                        <label class="form-label">Status</label>
                        <select v-model="userForm.status" class="form-input">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      
                      <div>
                        <label class="form-label">Department</label>
                        <input
                          v-model="userForm.department"
                          type="text"
                          class="form-input"
                        />
                      </div>
                      
                      <div>
                        <label class="form-label">Job Title</label>
                        <input
                          v-model="userForm.jobTitle"
                          type="text"
                          class="form-input"
                        />
                      </div>
                      
                      <div v-if="!isEditMode" class="md:col-span-2">
                        <label class="form-label">Password *</label>
                        <input
                          v-model="userForm.password"
                          type="password"
                          class="form-input"
                          :required="!isEditMode"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  :disabled="saving"
                  class="btn-primary sm:ml-3 sm:w-auto w-full"
                >
                  <Icon v-if="saving" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
                  {{ saving ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User') }}
                </button>
                <button
                  type="button"
                  @click="closeModal"
                  class="btn-outline mt-3 sm:mt-0 sm:w-auto w-full"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeDeleteModal"></div>
          
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-red-600" />
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">
                    Delete User
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Are you sure you want to delete <strong>{{ userToDelete?.firstName }} {{ userToDelete?.lastName }}</strong>? 
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                @click="confirmDelete"
                :disabled="deleting"
                class="btn-danger sm:ml-3 sm:w-auto w-full"
              >
                <Icon v-if="deleting" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
                {{ deleting ? 'Deleting...' : 'Delete User' }}
              </button>
              <button
                @click="closeDeleteModal"
                class="btn-outline mt-3 sm:mt-0 sm:w-auto w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
// Reactive data
const loading = ref(true)
const error = ref('')
const users = ref([])
const summary = ref({ total: 0, active: 0, inactive: 0, admins: 0, users: 0 })
const pagination = ref({ page: 1, limit: 10, total: 0, pages: 0 })

// Modal states
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditMode = ref(false)
const saving = ref(false)
const deleting = ref(false)

// Form data
const userForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'user',
  status: 'active',
  department: '',
  jobTitle: '',
  password: ''
})

const userToDelete = ref(null)

// Computed
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    // Add filtering logic here if needed
    return true
  })
})

// Methods
const loadUsers = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // Get authentication token with fallback to localStorage
    const token = useCookie('auth-token')
    let authToken = token.value
    
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }
    
    console.log('Auth token:', authToken ? 'Present' : 'Missing')
    
    if (!authToken) {
      throw new Error('Authentication required. Please login again.')
    }

    const queryParams = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString()
    })

    const response = await $fetch(`/api/users?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    if (response.success) {
      users.value = response.data.users
      summary.value = response.data.summary
      pagination.value = response.data.pagination
    } else {
      throw new Error('Failed to load users')
    }
  } catch (err) {
    console.error('Error loading users:', err)
    error.value = err.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

const getRoleBadgeClass = (role) => {
  const classes = {
    admin: 'bg-red-100 text-red-800',
    user: 'bg-green-100 text-green-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

const getStatusBadgeClass = (status) => {
  return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

// Modal methods
const openAddModal = () => {
  isEditMode.value = false
  userForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    department: '',
    jobTitle: '',
    password: ''
  }
  showModal.value = true
}

const openEditModal = (user) => {
  isEditMode.value = true
  userForm.value = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    status: user.status,
    department: user.department || '',
    jobTitle: user.jobTitle || '',
    password: ''
  }
  userToDelete.value = user
  showModal.value = true
}

const openDeleteModal = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const closeModal = () => {
  showModal.value = false
  userForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    department: '',
    jobTitle: '',
    password: ''
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

// CRUD operations
const saveUser = async () => {
  try {
    saving.value = true
    error.value = ''
    
    const token = useCookie('auth-token')
    let authToken = token.value
    
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }
    
    if (!authToken) {
      throw new Error('Authentication required. Please login again.')
    }

    const url = isEditMode.value 
      ? `/api/users/${userToDelete.value._id}`
      : '/api/users'
    
    const method = isEditMode.value ? 'PUT' : 'POST'
    
    const response = await $fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: userForm.value
    })
    
    if (response.success) {
      closeModal()
      await loadUsers() // Reload users list
    } else {
      throw new Error(response.message || 'Failed to save user')
    }
  } catch (err) {
    console.error('Error saving user:', err)
    error.value = err.message || 'Failed to save user'
  } finally {
    saving.value = false
  }
}

const confirmDelete = async () => {
  try {
    deleting.value = true
    error.value = ''
    
    const token = useCookie('auth-token')
    let authToken = token.value
    
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }
    
    if (!authToken) {
      throw new Error('Authentication required. Please login again.')
    }

    const response = await $fetch(`/api/users/${userToDelete.value._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    if (response.success) {
      closeDeleteModal()
      await loadUsers() // Reload users list
    } else {
      throw new Error(response.message || 'Failed to delete user')
    }
  } catch (err) {
    console.error('Error deleting user:', err)
    error.value = err.message || 'Failed to delete user'
  } finally {
    deleting.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadUsers()
})

// Meta
definePageMeta({
  layout: 'default',
  auth: true
})
</script>
