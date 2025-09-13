<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Lead Assignments</h1>
        <p class="text-gray-600">Track and manage lead assignments, transfers, and performance</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card bg-red-50 border-red-200">
        <div class="card-body text-center">
          <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Assignments</h3>
          <p class="text-red-700 mb-4">{{ error }}</p>
          <button @click="loadAssignments" class="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-8">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:users" class="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Assignments</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.totalAssignments }}</p>
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
                  <p class="text-sm font-medium text-gray-500">Active</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.activeAssignments }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:arrow-right-left" class="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Transferred</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.transferredAssignments }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:cog-6-tooth" class="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Rule Based</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.ruleBasedAssignments }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Performance -->
        <div v-if="userStats.length > 0" class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Top Performers (Last 30 Days)</h3>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="user in userStats" :key="user.userId" class="p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-medium text-gray-900">{{ user.userName }}</h4>
                  <span class="text-sm text-gray-500">{{ user.assignmentCount }} assignments</span>
                </div>
                <div class="flex items-center">
                  <div class="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      class="bg-blue-600 h-2 rounded-full" 
                      :style="{ width: `${Math.min(100, (user.assignmentCount / Math.max(...userStats.map(u => u.assignmentCount))) * 100)}%` }"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-600">{{ user.avgScore || 0 }}% avg score</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="card">
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="form-label">Assignment Type</label>
                <select v-model="selectedType" @change="filterAssignments" class="form-input">
                  <option value="">All Types</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="rule_based">Rule Based</option>
                </select>
              </div>
              <div>
                <label class="form-label">Status</label>
                <select v-model="selectedStatus" @change="filterAssignments" class="form-input">
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="transferred">Transferred</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label class="form-label">Date From</label>
                <input 
                  v-model="dateFrom" 
                  type="date" 
                  class="form-input"
                  @change="filterAssignments"
                />
              </div>
              <div>
                <label class="form-label">Date To</label>
                <input 
                  v-model="dateTo" 
                  type="date" 
                  class="form-input"
                  @change="filterAssignments"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Assignments List -->
        <div class="card">
          <div class="card-body p-0">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Date
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="assignment in assignments" :key="assignment._id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span class="text-sm font-medium text-gray-700">
                              {{ assignment.leadId?.firstName?.charAt(0) }}{{ assignment.leadId?.lastName?.charAt(0) }}
                            </span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">
                            {{ assignment.leadId?.firstName }} {{ assignment.leadId?.lastName }}
                          </div>
                          <div class="text-sm text-gray-500">{{ assignment.leadId?.company }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{ assignment.assignedTo?.firstName }} {{ assignment.assignedTo?.lastName }}
                      </div>
                      <div class="text-sm text-gray-500">{{ assignment.assignedTo?.email }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="badge" :class="getTypeBadgeClass(assignment.assignmentType)">
                        {{ formatAssignmentType(assignment.assignmentType) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="badge" :class="getStatusBadgeClass(assignment.status)">
                        {{ formatStatus(assignment.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(assignment.assignedAt) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div v-if="assignment.metadata?.assignmentScore" class="flex items-center">
                        <div class="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            class="bg-blue-600 h-2 rounded-full" 
                            :style="{ width: `${assignment.metadata.assignmentScore}%` }"
                          ></div>
                        </div>
                        <span class="text-sm text-gray-600">{{ assignment.metadata.assignmentScore }}%</span>
                      </div>
                      <span v-else class="text-sm text-gray-400">N/A</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <button 
                          v-if="assignment.status === 'active'" 
                          @click="openTransferModal(assignment)" 
                          class="text-blue-600 hover:text-blue-900"
                          title="Transfer Assignment"
                        >
                          <Icon name="heroicons:arrow-right-left" class="w-4 h-4" />
                        </button>
                        <button 
                          @click="viewAssignmentDetails(assignment)" 
                          class="text-green-600 hover:text-green-900"
                          title="View Details"
                        >
                          <Icon name="heroicons:eye" class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.totalPages > 1" class="card-footer">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-700">
                Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} results
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="currentPage = Math.max(1, currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="btn btn-outline btn-sm"
                  :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
                >
                  Previous
                </button>
                <span class="text-sm text-gray-700">
                  Page {{ currentPage }} of {{ pagination.totalPages }}
                </span>
                <button
                  @click="currentPage = Math.min(pagination.totalPages, currentPage + 1)"
                  :disabled="currentPage === pagination.totalPages"
                  class="btn btn-outline btn-sm"
                  :class="{ 'opacity-50 cursor-not-allowed': currentPage === pagination.totalPages }"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="assignments.length === 0" class="empty-state">
          <Icon name="heroicons:users" class="empty-state-icon" />
          <h3 class="empty-state-title">No assignments found</h3>
          <p class="empty-state-description">
            No lead assignments match your current filters.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Transfer Modal -->
    <Teleport to="body">
      <div v-if="showTransferModal" class="transfer-modal">
        <div class="modal-overlay" @click="closeTransferModal"></div>
        <div class="modal-container max-w-md" @click.stop>
        <div class="modal-content">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Transfer Assignment</h3>
            <button @click="closeTransferModal" class="text-gray-400 hover:text-gray-600">
              <Icon name="heroicons:x-mark" class="w-6 h-6" />
            </button>
          </div>
          
          <div class="card-body">
            <div class="mb-4">
              <p class="text-sm text-gray-600 mb-2">
                Transfer assignment for <strong>{{ selectedAssignment?.leadId?.firstName }} {{ selectedAssignment?.leadId?.lastName }}</strong>
              </p>
            </div>
            
            <div class="mb-4">
              <label class="form-label">Transfer to User *</label>
              <select v-model="transferForm.newUserId" class="form-input" required>
                <option value="">Select user</option>
                <option v-for="user in users" :key="user._id" :value="user._id">
                  {{ user.firstName }} {{ user.lastName }} ({{ user.role }})
                </option>
              </select>
            </div>
            
            <div class="mb-4">
              <label class="form-label">Transfer Reason</label>
              <textarea 
                v-model="transferForm.reason" 
                class="form-input" 
                rows="3"
                placeholder="Enter reason for transfer"
              ></textarea>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="flex justify-end space-x-2">
              <button @click="closeTransferModal" class="btn btn-outline">Cancel</button>
              <button @click="transferAssignment" class="btn btn-primary" :disabled="transferring">
                <span v-if="transferring" class="loading-spinner mr-2"></span>
                Transfer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCookie } from '#app'

// Use settings composable
const { formatDate } = useSettings()

// Reactive data
const loading = ref(true)
const error = ref('')
const assignments = ref([])
const users = ref([])
const stats = ref({
  totalAssignments: 0,
  activeAssignments: 0,
  transferredAssignments: 0,
  completedAssignments: 0,
  manualAssignments: 0,
  automaticAssignments: 0,
  ruleBasedAssignments: 0
})
const userStats = ref([])
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false
})

// Filters
const selectedType = ref('')
const selectedStatus = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)

// Modal states
const showTransferModal = ref(false)
const transferring = ref(false)
const selectedAssignment = ref(null)

// Transfer form
const transferForm = ref({
  newUserId: '',
  reason: ''
})

// Methods
const loadAssignments = async () => {
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

    const query = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: pagination.value.limit.toString(),
      assignmentType: selectedType.value,
      status: selectedStatus.value,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value
    }).toString()

    const response = await $fetch(`/api/assignments/history?${query}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (response.success) {
      assignments.value = response.data.assignments
      stats.value = response.data.stats
      userStats.value = response.data.userStats
      pagination.value = response.data.pagination
    } else {
      throw new Error('Failed to load assignments')
    }
  } catch (err) {
    console.error('Error loading assignments:', err)
    error.value = err.data?.message || err.message || 'Failed to load assignments'
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    const token = useCookie('auth-token')
    let authToken = token.value
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }
    if (!authToken) {
      throw new Error('Authentication required')
    }

    const response = await $fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (response.success) {
      users.value = response.data.users.filter(user => 
        ['sales', 'manager'].includes(user.role)
      )
    }
  } catch (err) {
    console.error('Error loading users:', err)
  }
}

const filterAssignments = () => {
  currentPage.value = 1
  loadAssignments()
}

const openTransferModal = (assignment) => {
  selectedAssignment.value = assignment
  transferForm.value = {
    newUserId: '',
    reason: ''
  }
  showTransferModal.value = true
}

const closeTransferModal = () => {
  showTransferModal.value = false
  selectedAssignment.value = null
}

const transferAssignment = async () => {
  if (!transferForm.value.newUserId) {
    const { warning } = useAlert()
    await warning('Please select a user to transfer to')
    return
  }

  try {
    transferring.value = true

    const token = useCookie('auth-token')
    let authToken = token.value
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }
    if (!authToken) {
      throw new Error('Authentication required')
    }

    const response = await $fetch('/api/assignments/transfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: {
        assignmentId: selectedAssignment.value._id,
        newUserId: transferForm.value.newUserId,
        reason: transferForm.value.reason
      }
    })

    if (response.success) {
      closeTransferModal()
      loadAssignments()
    } else {
      throw new Error('Failed to transfer assignment')
    }
  } catch (err) {
    console.error('Error transferring assignment:', err)
    const { error: showError } = useAlert()
    await showError('Failed to transfer assignment', err.data?.message || err.message || 'Please try again')
  } finally {
    transferring.value = false
  }
}

const viewAssignmentDetails = (assignment) => {
  // TODO: Implement assignment details modal
  console.log('View assignment details:', assignment)
}

const getTypeBadgeClass = (type) => {
  const classes = {
    'manual': 'bg-blue-100 text-blue-800',
    'automatic': 'bg-green-100 text-green-800',
    'rule_based': 'bg-purple-100 text-purple-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'active': 'bg-green-100 text-green-800',
    'transferred': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-blue-100 text-blue-800',
    'rejected': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatAssignmentType = (type) => {
  const types = {
    'manual': 'Manual',
    'automatic': 'Automatic',
    'rule_based': 'Rule Based'
  }
  return types[type] || type
}

const formatStatus = (status) => {
  const statuses = {
    'active': 'Active',
    'transferred': 'Transferred',
    'completed': 'Completed',
    'rejected': 'Rejected'
  }
  return statuses[status] || status
}

// Watch for page changes
watch(currentPage, () => {
  loadAssignments()
})

onMounted(() => {
  loadAssignments()
  loadUsers()
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

.loading-spinner {
  @apply animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600;
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

.transfer-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-container {
  position: relative;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow-y: auto;
  z-index: 10000;
}

.modal-content {
  @apply relative;
}

.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.card-header {
  @apply px-6 py-4 border-b border-gray-200 flex items-center justify-between;
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
