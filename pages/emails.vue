<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Email Management</h1>
        <p class="text-gray-600">Manage your emails, drafts, and communication history</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card bg-red-50 border-red-200">
        <div class="card-body text-center">
          <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Emails</h3>
          <p class="text-red-700 mb-4">{{ error }}</p>
          <button @click="loadEmails" class="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-8">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:envelope" class="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Emails</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.totalEmails }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:paper-airplane" class="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Sent</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.sentEmails }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:document" class="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Drafts</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.draftEmails }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between items-center">
          <div class="flex space-x-4">
            <button @click="openEmailComposer" class="btn btn-primary">
              <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
              Compose Email
            </button>
            <button @click="loadEmails" class="btn btn-outline">
              <Icon name="heroicons:arrow-path" class="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>
          
          <div class="flex space-x-2">
            <select v-model="selectedType" @change="filterEmails" class="form-input">
              <option value="all">All Emails</option>
              <option value="sent">Sent</option>
              <option value="draft">Drafts</option>
            </select>
            <input 
              v-model="searchQuery" 
              @input="debouncedSearch" 
              type="text" 
              placeholder="Search emails..." 
              class="form-input"
            />
          </div>
        </div>

        <!-- Emails List -->
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
                      Subject
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="email in emails" :key="email._id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span class="text-sm font-medium text-gray-700">
                              {{ email.leadId?.firstName?.charAt(0) }}{{ email.leadId?.lastName?.charAt(0) }}
                            </span>
                          </div>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">
                            {{ email.leadId?.firstName }} {{ email.leadId?.lastName }}
                          </div>
                          <div class="text-sm text-gray-500">{{ email.leadId?.company }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-900">{{ email.metadata?.subject || 'No subject' }}</div>
                      <div class="text-sm text-gray-500 truncate max-w-xs">
                        {{ email.description }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span v-if="email.metadata?.isDraft" class="badge bg-yellow-100 text-yellow-800">
                        Draft
                      </span>
                      <span v-else-if="email.metadata?.messageId" class="badge bg-green-100 text-green-800">
                        Sent
                      </span>
                      <span v-else class="badge bg-gray-100 text-gray-800">
                        Unknown
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(email.createdAt) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <button 
                          @click="viewEmail(email)" 
                          class="text-blue-600 hover:text-blue-900"
                          title="View Email"
                        >
                          <Icon name="heroicons:eye" class="w-4 h-4" />
                        </button>
                        <button 
                          v-if="email.metadata?.isDraft" 
                          @click="editDraft(email)" 
                          class="text-green-600 hover:text-green-900"
                          title="Edit Draft"
                        >
                          <Icon name="heroicons:pencil" class="w-4 h-4" />
                        </button>
                        <button 
                          @click="deleteEmail(email._id)" 
                          class="text-red-600 hover:text-red-900"
                          title="Delete Email"
                        >
                          <Icon name="heroicons:trash" class="w-4 h-4" />
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
        <div v-if="emails.length === 0" class="empty-state">
          <Icon name="heroicons:envelope" class="empty-state-icon" />
          <h3 class="empty-state-title">No emails found</h3>
          <p class="empty-state-description">
            {{ selectedType === 'draft' ? 'No draft emails found' : 'No emails found' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Email Composer -->
    <EmailComposer 
      :show="showEmailComposer" 
      :lead-id="selectedLeadId"
      @close="closeEmailComposer"
      @sent="handleEmailSent"
    />

    <!-- Email Viewer Modal -->
    <div v-if="showEmailViewer" class="modal-overlay" @click="closeEmailViewer">
      <div class="modal-container max-w-4xl" @click.stop>
        <div class="modal-content">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Email Details</h3>
            <button @click="closeEmailViewer" class="text-gray-400 hover:text-gray-600">
              <Icon name="heroicons:x-mark" class="w-6 h-6" />
            </button>
          </div>
          
          <div class="card-body">
            <div class="mb-4">
              <h4 class="font-semibold text-gray-900 mb-2">To:</h4>
              <p class="text-sm text-gray-700">{{ selectedEmail?.leadId?.firstName }} {{ selectedEmail?.leadId?.lastName }} ({{ selectedEmail?.leadId?.email }})</p>
            </div>
            
            <div class="mb-4">
              <h4 class="font-semibold text-gray-900 mb-2">Subject:</h4>
              <p class="text-sm text-gray-700">{{ selectedEmail?.metadata?.subject }}</p>
            </div>
            
            <div class="mb-4">
              <h4 class="font-semibold text-gray-900 mb-2">Content:</h4>
              <div class="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                <div v-html="selectedEmail?.metadata?.html"></div>
              </div>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="flex justify-end space-x-2">
              <button @click="closeEmailViewer" class="btn btn-outline">Close</button>
              <button v-if="selectedEmail?.metadata?.isDraft" @click="editDraft(selectedEmail)" class="btn btn-primary">Edit Draft</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCookie } from '#app'

// Use settings composable
const { formatDate } = useSettings()

// Reactive data
const loading = ref(true)
const error = ref('')
const emails = ref([])
const stats = ref({
  totalEmails: 0,
  sentEmails: 0,
  draftEmails: 0
})
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false
})

// Filters
const selectedType = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)

// Modal states
const showEmailComposer = ref(false)
const showEmailViewer = ref(false)
const selectedLeadId = ref('')
const selectedEmail = ref(null)

// Methods
const loadEmails = async () => {
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
      type: selectedType.value,
      search: searchQuery.value
    }).toString()

    const response = await $fetch(`/api/email/history?${query}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (response.success) {
      emails.value = response.data.emails
      stats.value = response.data.stats
      pagination.value = response.data.pagination
    } else {
      throw new Error('Failed to load emails')
    }
  } catch (err) {
    console.error('Error loading emails:', err)
    error.value = err.data?.message || err.message || 'Failed to load emails'
  } finally {
    loading.value = false
  }
}

const filterEmails = () => {
  currentPage.value = 1
  loadEmails()
}

const debouncedSearch = debounce(() => {
  currentPage.value = 1
  loadEmails()
}, 500)

const openEmailComposer = () => {
  selectedLeadId.value = ''
  showEmailComposer.value = true
}

const closeEmailComposer = () => {
  showEmailComposer.value = false
  selectedLeadId.value = ''
}

const handleEmailSent = (data) => {
  console.log('Email sent:', data)
  loadEmails()
}

const viewEmail = (email) => {
  selectedEmail.value = email
  showEmailViewer.value = true
}

const closeEmailViewer = () => {
  showEmailViewer.value = false
  selectedEmail.value = null
}

const editDraft = (email) => {
  selectedLeadId.value = email.leadId._id
  showEmailComposer.value = true
  // TODO: Load draft content into composer
}

const deleteEmail = async (emailId) => {
  const { confirm } = useAlert()
  const result = await confirm('Delete Email', 'Are you sure you want to delete this email?', 'Yes, Delete', 'Cancel')
  if (!result.isConfirmed) return
  
  try {
    const token = useCookie('auth-token')
    let authToken = token.value
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }
    if (!authToken) {
      throw new Error('Authentication required')
    }

    await $fetch(`/api/activities/${emailId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    loadEmails()
  } catch (err) {
    console.error('Error deleting email:', err)
    const { error: showError } = useAlert()
    await showError('Failed to delete email', err.data?.message || err.message || 'Please try again')
  }
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

// Watch for page changes
watch(currentPage, () => {
  loadEmails()
})

onMounted(() => {
  loadEmails()
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
