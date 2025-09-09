<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Activities</h1>
            <p class="text-gray-600">Track and manage all your CRM activities</p>
          </div>
          <button class="btn-primary">
            <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
            New Activity
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-8">
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="form-label">Type</label>
              <select v-model="filters.type" class="form-input">
                <option value="">All Types</option>
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="task">Task</option>
              </select>
            </div>
            <div>
              <label class="form-label">Status</label>
              <select v-model="filters.status" class="form-input">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label class="form-label">Assigned To</label>
              <select v-model="filters.assignedTo" class="form-input">
                <option value="">All Users</option>
                <option value="me">Me</option>
                <option value="team">Team</option>
              </select>
            </div>
            <div>
              <label class="form-label">Date Range</label>
              <select v-model="filters.dateRange" class="form-input">
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Activities List -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900">Recent Activities</h3>
        </div>
        <div class="card-body p-0">
          <div class="overflow-hidden">
            <table class="table">
              <thead class="table-header">
                <tr>
                  <th class="table-header-cell">Activity</th>
                  <th class="table-header-cell">Lead</th>
                  <th class="table-header-cell">Type</th>
                  <th class="table-header-cell">Status</th>
                  <th class="table-header-cell">Assigned To</th>
                  <th class="table-header-cell">Due Date</th>
                  <th class="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody class="table-body">
                <tr v-for="activity in filteredActivities" :key="activity.id" class="table-row">
                  <td class="table-cell">
                    <div class="flex items-center">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                           :class="getActivityIconClass(activity.type)">
                        <Icon :name="getActivityIcon(activity.type)" class="w-4 h-4" />
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{{ activity.title }}</p>
                        <p class="text-sm text-gray-600">{{ activity.description }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="table-cell">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                        {{ activity.lead.name.charAt(0) }}
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{{ activity.lead.name }}</p>
                        <p class="text-sm text-gray-600">{{ activity.lead.company }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="table-cell">
                    <span class="badge" :class="getTypeBadgeClass(activity.type)">
                      {{ activity.type }}
                    </span>
                  </td>
                  <td class="table-cell">
                    <span class="badge" :class="getStatusBadgeClass(activity.status)">
                      {{ activity.status }}
                    </span>
                  </td>
                  <td class="table-cell">
                    <div class="flex items-center">
                      <div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                        {{ activity.assignedTo.charAt(0) }}
                      </div>
                      <span class="text-sm text-gray-900">{{ activity.assignedTo }}</span>
                    </div>
                  </td>
                  <td class="table-cell">
                    <span class="text-sm text-gray-900">{{ formatDate(activity.dueDate) }}</span>
                  </td>
                  <td class="table-cell">
                    <div class="flex items-center space-x-2">
                      <button class="text-blue-600 hover:text-blue-800">
                        <Icon name="heroicons:pencil" class="w-4 h-4" />
                      </button>
                      <button class="text-green-600 hover:text-green-800">
                        <Icon name="heroicons:check" class="w-4 h-4" />
                      </button>
                      <button class="text-red-600 hover:text-red-800">
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
</template>

<script setup>
// Reactive data
const loading = ref(true)
const error = ref('')
const activities = ref([])
const summary = ref({ total: 0, completed: 0, pending: 0, overdue: 0 })
const pagination = ref({ page: 1, limit: 10, total: 0, pages: 0 })

const filters = ref({
  type: '',
  status: '',
  assignedTo: '',
  dateRange: ''
})

// Computed
const filteredActivities = computed(() => {
  return activities.value.filter(activity => {
    if (filters.value.type && activity.type !== filters.value.type) return false
    if (filters.value.status && activity.status !== filters.value.status) return false
    return true
  })
})

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

    const queryParams = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      ...Object.fromEntries(Object.entries(filters.value).filter(([_, v]) => v))
    })

    const response = await $fetch(`/api/activities?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    if (response.success) {
      activities.value = response.data.activities
      summary.value = response.data.summary
      pagination.value = response.data.pagination
    } else {
      throw new Error('Failed to load activities')
    }
  } catch (err) {
    console.error('Error loading activities:', err)
    error.value = err.message || 'Failed to load activities'
  } finally {
    loading.value = false
  }
}

const getActivityIcon = (type) => {
  const icons = {
    call: 'heroicons:phone',
    email: 'heroicons:envelope',
    meeting: 'heroicons:calendar',
    task: 'heroicons:check-circle',
    follow_up: 'heroicons:clock'
  }
  return icons[type] || 'heroicons:question-mark-circle'
}

const getActivityIconClass = (type) => {
  const classes = {
    call: 'bg-green-100 text-green-600',
    email: 'bg-blue-100 text-blue-600',
    meeting: 'bg-purple-100 text-purple-600',
    task: 'bg-yellow-100 text-yellow-600',
    follow_up: 'bg-orange-100 text-orange-600'
  }
  return classes[type] || 'bg-gray-100 text-gray-600'
}

const getTypeBadgeClass = (type) => {
  const classes = {
    call: 'badge-primary',
    email: 'badge-success',
    meeting: 'badge-warning',
    task: 'badge-gray',
    follow_up: 'badge-info'
  }
  return classes[type] || 'badge-gray'
}

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'badge-warning',
    completed: 'badge-success',
    overdue: 'badge-danger'
  }
  return classes[status] || 'badge-gray'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

const applyFilters = () => {
  pagination.value.page = 1
  loadActivities()
}

// Lifecycle
onMounted(() => {
  loadActivities()
})

// Meta
definePageMeta({
  layout: 'default',
  auth: true
})
</script>
