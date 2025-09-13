<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Activities</h1>
        <p class="text-gray-600">Track and manage all your activities and tasks</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card bg-red-50 border-red-200">
        <div class="card-body text-center">
          <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Activities</h3>
          <p class="text-red-700 mb-4">{{ error }}</p>
          <button @click="loadActivities" class="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>

      <!-- Debug Info -->
      <div v-if="!loading && !error" class="mb-4 p-4 bg-blue-50 rounded-lg">
        <p class="text-sm text-blue-700">
          Debug: Activities count: {{ activities.length }}, 
          Stats: {{ JSON.stringify(stats) }}, 
          Pagination: {{ JSON.stringify(pagination) }}
        </p>
      </div>

      <!-- Main Content -->
      <div v-if="!loading && !error" class="space-y-8">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:clock" class="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Activities</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.totalActivities }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Completed Today</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.completedToday }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:clock" class="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Pending</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.pendingActivities }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Overdue</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.overdueActivities }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and Actions -->
        <div class="card">
          <div class="card-body">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <!-- Filters -->
              <div class="flex flex-wrap gap-4">
                <div class="flex items-center space-x-2">
                  <label class="text-sm font-medium text-gray-700">Type:</label>
                  <select v-model="filters.type" @change="applyFilters" class="form-input">
                    <option value="all">All Types</option>
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="note">Note</option>
                    <option value="task">Task</option>
                    <option value="status_change">Status Change</option>
                    <option value="file_upload">File Upload</option>
                    <option value="ai_insight">AI Insight</option>
                  </select>
                </div>

                <div class="flex items-center space-x-2">
                  <label class="text-sm font-medium text-gray-700">Priority:</label>
                  <select v-model="filters.priority" @change="applyFilters" class="form-input">
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div class="flex items-center space-x-2">
                  <label class="text-sm font-medium text-gray-700">Status:</label>
                  <select v-model="filters.status" @change="applyFilters" class="form-input">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div class="flex items-center space-x-2">
                  <label class="text-sm font-medium text-gray-700">Sort:</label>
                  <select v-model="filters.sortBy" @change="applyFilters" class="form-input">
                    <option value="createdAt">Created Date</option>
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="title">Title</option>
                  </select>
                </div>
              </div>

              <!-- Search and Actions -->
              <div class="flex items-center space-x-4">
                <div class="relative">
                  <input
                    v-model="filters.search"
                    type="text"
                    placeholder="Search activities..."
                    class="form-input pl-10"
                    @input="debouncedSearch"
                  />
                  <Icon name="heroicons:magnifying-glass" class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button @click="showCreateModal = true" class="btn btn-primary">
                  <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
                  New Activity
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Activities List -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">All Activities</h3>
          </div>
          <div class="card-body p-0">
            <div v-if="activities.length === 0" class="empty-state">
              <Icon name="heroicons:clock" class="empty-state-icon" />
              <h3 class="empty-state-title">No activities found</h3>
              <p class="empty-state-description">
                Get started by creating your first activity
              </p>
              <div class="mt-6">
                <button @click="showCreateModal = true" class="btn btn-primary">
                  <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
                  Create Activity
                </button>
              </div>
            </div>

            <div v-else class="divide-y divide-gray-200">
              <div v-for="activity in activities" :key="activity._id" 
                   class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-start justify-between">
                  <div class="flex items-start space-x-4">
                    <!-- Activity Icon -->
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center"
                           :class="getActivityIconClass(activity.type)">
                        <Icon :name="getActivityIcon(activity.type)" class="w-5 h-5" />
                      </div>
                    </div>

                    <!-- Activity Content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center space-x-2 mb-2">
                        <h4 class="text-lg font-medium text-gray-900">{{ activity.title }}</h4>
                        <span :class="getPriorityClass(activity.priority)" class="badge">
                          {{ activity.priority }}
                        </span>
                        <span v-if="activity.isCompleted" class="badge status-completed">
                          Completed
                        </span>
                        <span v-else-if="isOverdue(activity.dueDate, activity.isCompleted)" class="badge status-overdue">
                          Overdue
                        </span>
                      </div>

                      <p class="text-gray-600 mb-3">{{ activity.description }}</p>

                      <!-- Activity Details -->
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                        <div class="flex items-center">
                          <Icon name="heroicons:user" class="w-4 h-4 mr-2" />
                          <span>Lead: {{ activity.leadId?.firstName }} {{ activity.leadId?.lastName }}</span>
                        </div>
                        <div class="flex items-center">
                          <Icon name="heroicons:calendar" class="w-4 h-4 mr-2" />
                          <span>Created: {{ formatDate(activity.createdAt) }}</span>
                        </div>
                        <div v-if="activity.dueDate" class="flex items-center">
                          <Icon name="heroicons:clock" class="w-4 h-4 mr-2" />
                          <span>Due: {{ formatDate(activity.dueDate) }}</span>
                        </div>
                      </div>

                      <!-- Assigned To -->
                      <div v-if="activity.assignedTo" class="mt-2 text-sm text-gray-500">
                        <Icon name="heroicons:user-circle" class="w-4 h-4 mr-1 inline" />
                        Assigned to: {{ activity.assignedTo.firstName }} {{ activity.assignedTo.lastName }}
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="toggleComplete(activity)"
                      :class="activity.isCompleted ? 'btn btn-outline' : 'btn btn-primary'"
                      class="btn-sm"
                    >
                      <Icon :name="activity.isCompleted ? 'heroicons:arrow-uturn-left' : 'heroicons:check'" class="w-4 h-4 mr-1" />
                      {{ activity.isCompleted ? 'Reopen' : 'Complete' }}
                    </button>
                    <button @click="editActivity(activity)" class="btn btn-outline btn-sm">
                      <Icon name="heroicons:pencil" class="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button @click="deleteActivity(activity._id)" class="btn btn-outline btn-sm text-red-600 hover:text-red-700">
                      <Icon name="heroicons:trash" class="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.totalPages > 1" class="card-footer">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-700">
                Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
                {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
                {{ pagination.total }} results
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="changePage(pagination.page - 1)"
                  :disabled="!pagination.hasPrevPage"
                  class="btn btn-outline btn-sm"
                  :class="{ 'opacity-50 cursor-not-allowed': !pagination.hasPrevPage }"
                >
                  Previous
                </button>
                <span class="text-sm text-gray-700">
                  Page {{ pagination.page }} of {{ pagination.totalPages }}
                </span>
                <button
                  @click="changePage(pagination.page + 1)"
                  :disabled="!pagination.hasNextPage"
                  class="btn btn-outline btn-sm"
                  :class="{ 'opacity-50 cursor-not-allowed': !pagination.hasNextPage }"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Activity Modal -->
      <Teleport to="body">
        <div v-if="showCreateModal || showEditModal" class="modal-overlay">
          <div class="modal-container">
            <div class="modal-content">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ showCreateModal ? 'Create New Activity' : 'Edit Activity' }}
                </h3>
              </div>
              <div class="px-6 py-4">
                <form @submit.prevent="saveActivity">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="form-label">Type *</label>
                      <select v-model="activityForm.type" class="form-input" required>
                        <option value="">Select Type</option>
                        <option value="call">Call</option>
                        <option value="email">Email</option>
                        <option value="meeting">Meeting</option>
                        <option value="note">Note</option>
                        <option value="task">Task</option>
                        <option value="status_change">Status Change</option>
                        <option value="file_upload">File Upload</option>
                        <option value="ai_insight">AI Insight</option>
                      </select>
                    </div>

                    <div>
                      <label class="form-label">Priority</label>
                      <select v-model="activityForm.priority" class="form-input">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div class="md:col-span-2">
                      <label class="form-label">Title *</label>
                      <input
                        v-model="activityForm.title"
                        type="text"
                        class="form-input"
                        placeholder="Enter activity title"
                        required
                      />
                    </div>

                    <div class="md:col-span-2">
                      <label class="form-label">Description *</label>
                      <textarea
                        v-model="activityForm.description"
                        class="form-input"
                        rows="3"
                        placeholder="Enter activity description"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label class="form-label">Lead</label>
                      <select v-model="activityForm.leadId" class="form-input" required>
                        <option value="">Select Lead</option>
                        <option v-for="lead in leads" :key="lead._id" :value="lead._id">
                          {{ lead.firstName }} {{ lead.lastName }} - {{ lead.company }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="form-label">Due Date</label>
                      <input
                        v-model="activityForm.dueDate"
                        type="datetime-local"
                        class="form-input"
                      />
                    </div>
                  </div>

                  <div class="flex justify-end space-x-3 mt-6">
                    <button type="button" @click="closeModal" class="btn btn-outline">
                      Cancel
                    </button>
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                      <Icon v-if="loading" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
                      {{ showCreateModal ? 'Create Activity' : 'Update Activity' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
// Use settings composable
const { formatDate } = useSettings()

// Reactive data
const loading = ref(true)
const error = ref('')
const activities = ref([])
const stats = ref({})
const pagination = ref({})
const leads = ref([])

// Filters
const filters = ref({
  type: 'all',
  priority: 'all',
  status: 'all',
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingActivity = ref(null)

// Activity form
const activityForm = ref({
  type: '',
  title: '',
  description: '',
  leadId: '',
  priority: 'medium',
  dueDate: ''
})

// Computed properties
const isOverdue = (dueDate, isCompleted) => {
  if (!dueDate) return false
  return new Date(dueDate) < new Date() && !isCompleted
}

// Methods
const loadActivities = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const token = useCookie('auth-token')
    let authToken = token.value
    
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }
    
    if (!authToken) {
      throw new Error('Authentication required')
    }

    // Build query parameters
    const queryParams = new URLSearchParams()
    Object.entries(filters.value).forEach(([key, value]) => {
      if (value && value !== 'all') {
        queryParams.append(key, value)
      }
    })

    const response = await $fetch(`/api/activities?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    if (response.success) {
      console.log('Activities loaded:', response.data)
      activities.value = response.data || []
      stats.value = response.stats || {}
      pagination.value = response.pagination || {}
    } else {
      throw new Error('Failed to load activities')
    }
  } catch (err) {
    console.error('Error loading activities:', err)
    error.value = err.data?.message || err.message || 'Failed to load activities'
  } finally {
    loading.value = false
  }
}

const loadLeads = async () => {
  try {
    const token = useCookie('auth-token')
    let authToken = token.value
    
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }

    const response = await $fetch('/api/leads', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    if (response.success) {
      leads.value = response.data
    }
  } catch (err) {
    console.error('Error loading leads:', err)
  }
}

const applyFilters = () => {
  loadActivities()
}

const debouncedSearch = debounce(() => {
  applyFilters()
}, 500)

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    loadActivities()
  }
}

const toggleComplete = async (activity) => {
  try {
    const token = useCookie('auth-token')
    let authToken = token.value
    
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }

    const response = await $fetch(`/api/activities/${activity._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: {
        isCompleted: !activity.isCompleted
      }
    })
    
    if (response.success) {
      activity.isCompleted = !activity.isCompleted
      if (activity.isCompleted) {
        activity.completedAt = new Date()
      } else {
        activity.completedAt = undefined
      }
      await loadActivities() // Refresh stats
    }
  } catch (err) {
    console.error('Error updating activity:', err)
    const { error: showError } = useAlert()
    await showError('Failed to update activity', 'Please try again')
  }
}

const editActivity = (activity) => {
  editingActivity.value = activity
  activityForm.value = {
    type: activity.type,
    title: activity.title,
    description: activity.description,
    leadId: activity.leadId._id,
    priority: activity.priority,
    dueDate: activity.dueDate ? new Date(activity.dueDate).toISOString().slice(0, 16) : ''
  }
  showEditModal.value = true
}

const deleteActivity = async (activityId) => {
  const { confirm } = useAlert()
  const result = await confirm('Delete Activity', 'Are you sure you want to delete this activity?', 'Yes, Delete', 'Cancel')
  if (!result.isConfirmed) return

  try {
    const token = useCookie('auth-token')
    let authToken = token.value
    
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }

    const response = await $fetch(`/api/activities/${activityId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    if (response.success) {
      await loadActivities()
    }
  } catch (err) {
    console.error('Error deleting activity:', err)
    const { error: showError } = useAlert()
    await showError('Failed to delete activity', 'Please try again')
  }
}

const saveActivity = async () => {
  try {
    loading.value = true
    
    const token = useCookie('auth-token')
    let authToken = token.value
    
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }

    const url = showCreateModal.value ? '/api/activities' : `/api/activities/${editingActivity.value._id}`
    const method = showCreateModal.value ? 'POST' : 'PUT'

    const response = await $fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: activityForm.value
    })
    
    if (response.success) {
      closeModal()
      await loadActivities()
    }
  } catch (err) {
    console.error('Error saving activity:', err)
    const { error: showError } = useAlert()
    await showError('Failed to save activity', 'Please try again')
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingActivity.value = null
  activityForm.value = {
    type: '',
    title: '',
    description: '',
    leadId: '',
    priority: 'medium',
    dueDate: ''
  }
}

// Helper functions
const getActivityIcon = (type) => {
  const icons = {
    call: 'heroicons:phone',
    email: 'heroicons:envelope',
    meeting: 'heroicons:calendar',
    note: 'heroicons:document-text',
    task: 'heroicons:check-circle',
    status_change: 'heroicons:arrow-path',
    file_upload: 'heroicons:paper-clip',
    ai_insight: 'heroicons:sparkles'
  }
  return icons[type] || 'heroicons:clock'
}

const getActivityIconClass = (type) => {
  const classes = {
    call: 'bg-blue-100 text-blue-600',
    email: 'bg-green-100 text-green-600',
    meeting: 'bg-purple-100 text-purple-600',
    note: 'bg-yellow-100 text-yellow-600',
    task: 'bg-orange-100 text-orange-600',
    status_change: 'bg-gray-100 text-gray-600',
    file_upload: 'bg-indigo-100 text-indigo-600',
    ai_insight: 'bg-pink-100 text-pink-600'
  }
  return classes[type] || 'bg-gray-100 text-gray-600'
}

const getPriorityClass = (priority) => {
  const classes = {
    low: 'badge priority-low',
    medium: 'badge priority-medium',
    high: 'badge priority-high',
    urgent: 'badge priority-urgent'
  }
  return classes[priority] || 'badge priority-medium'
}

// Debounce utility
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadActivities(),
    loadLeads()
  ])
})

// Meta
definePageMeta({
  layout: 'default',
  auth: true
})
</script>

<style scoped>
.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.priority-low {
  @apply bg-gray-100 text-gray-800;
}

.priority-medium {
  @apply bg-yellow-100 text-yellow-800;
}

.priority-high {
  @apply bg-orange-100 text-orange-800;
}

.priority-urgent {
  @apply bg-red-100 text-red-800;
}

.status-completed {
  @apply bg-green-100 text-green-800;
}

.status-overdue {
  @apply bg-red-100 text-red-800;
}

.loading-spinner {
  @apply animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600;
}

.empty-state {
  @apply text-center py-12;
}

.empty-state-icon {
  @apply w-12 h-12 text-gray-400 mx-auto mb-4;
}

.empty-state-title {
  @apply text-lg font-medium text-gray-900 mb-2;
}

.empty-state-description {
  @apply text-gray-600;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-container {
  @apply bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto;
}

.modal-content {
  @apply relative;
}

.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.card-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.card-body {
  @apply px-6 py-4;
}

.card-footer {
  @apply px-6 py-4 border-t border-gray-200 bg-gray-50;
}

.btn {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500;
}

.btn-outline {
  @apply text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-blue-500;
}

.btn-sm {
  @apply px-3 py-1.5 text-xs;
}

.form-input {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
</style>