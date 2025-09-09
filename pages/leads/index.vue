<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="page-title">Leads Management</h1>
          <p class="page-subtitle">Manage and track all your leads with AI-powered insights</p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="exportLeads"
            class="btn btn-outline"
            :disabled="selectedLeads.length === 0"
          >
            <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            @click="showFilters = !showFilters"
            class="btn btn-outline"
          >
            <Icon name="heroicons:funnel" class="w-4 h-4 mr-2" />
            Filters
          </button>
          <button
            @click="showAIFollowUps = !showAIFollowUps"
            class="btn btn-outline"
            :class="{ 'bg-blue-50 text-blue-700': showAIFollowUps }"
          >
            <Icon name="heroicons:sparkles" class="w-4 h-4 mr-2" />
            AI Follow-ups
          </button>
          <NuxtLink to="/leads/new" class="btn btn-primary">
            <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
            Add Lead
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid mb-6">
      <div class="stat-card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Icon name="heroicons:users" class="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="stat-label">Total Leads</p>
            <p class="stat-value">{{ stats.totalLeads }}</p>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="stat-label">Qualified</p>
            <p class="stat-value">{{ stats.qualifiedLeads }}</p>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Icon name="heroicons:clock" class="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="stat-label">Pending Follow-up</p>
            <p class="stat-value">{{ stats.pendingFollowUps }}</p>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Icon name="heroicons:currency-dollar" class="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div class="ml-4">
            <p class="stat-label">Total Value</p>
            <p class="stat-value">${{ stats.totalValue.toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Follow-up Suggestions -->
    <div v-if="showAIFollowUps" class="card mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div class="card-body">
        <div class="flex items-center mb-4">
          <Icon name="heroicons:sparkles" class="w-5 h-5 text-blue-600 mr-2" />
          <h3 class="text-lg font-semibold text-gray-900">AI-Powered Follow-up Suggestions</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="suggestion in aiFollowUpSuggestions" :key="suggestion.id" 
               class="bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex items-start justify-between mb-2">
              <h4 class="font-medium text-gray-900">{{ suggestion.leadName }}</h4>
              <span :class="`badge priority-${suggestion.priority}`">
                {{ suggestion.priority.toUpperCase() }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-3">{{ suggestion.suggestion }}</p>
            <div class="flex space-x-2">
              <button 
                @click="scheduleFollowUp(suggestion.leadId, suggestion.suggestion)"
                class="btn btn-primary btn-sm"
              >
                Schedule
              </button>
              <button 
                @click="dismissSuggestion(suggestion.id)"
                class="btn btn-outline btn-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedLeads.length > 0" class="card mb-6 bg-blue-50 border-blue-200">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <Icon name="heroicons:check-circle" class="w-5 h-5 text-blue-600 mr-2" />
            <span class="text-sm font-medium text-blue-900">
              {{ selectedLeads.length }} lead(s) selected
            </span>
          </div>
          <div class="flex space-x-2">
            <button 
              @click="bulkUpdateStatus"
              class="btn btn-outline btn-sm"
            >
              Update Status
            </button>
            <button 
              @click="bulkAssign"
              class="btn btn-outline btn-sm"
            >
              Assign
            </button>
            <button 
              @click="bulkScheduleFollowUp"
              class="btn btn-outline btn-sm"
            >
              Schedule Follow-up
            </button>
            <button 
              @click="clearSelection"
              class="btn btn-outline btn-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div v-if="showFilters" class="card mb-6">
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="form-label">Search</label>
            <input
              v-model="filters.search"
              type="text"
              class="form-input"
              placeholder="Search leads..."
              @input="debouncedSearch"
            />
          </div>
          <div>
            <label class="form-label">Status</label>
            <select v-model="filters.status" class="form-input" @change="applyFilters">
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed_won">Closed Won</option>
              <option value="closed_lost">Closed Lost</option>
            </select>
          </div>
          <div>
            <label class="form-label">Priority</label>
            <select v-model="filters.priority" class="form-input" @change="applyFilters">
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label class="form-label">Source</label>
            <select v-model="filters.source" class="form-input" @change="applyFilters">
              <option value="">All Sources</option>
              <option value="website">Website</option>
              <option value="social_media">Social Media</option>
              <option value="referral">Referral</option>
              <option value="cold_call">Cold Call</option>
              <option value="email">Email</option>
              <option value="event">Event</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div class="flex justify-between items-center">
          <div class="flex space-x-2">
            <button @click="clearFilters" class="btn btn-outline btn-sm">
              Clear Filters
            </button>
          </div>
          <div class="text-sm text-gray-500">
            {{ filteredLeads.length }} of {{ leads.length }} leads
          </div>
        </div>
      </div>
    </div>

    <!-- Leads Table -->
    <div class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">All Leads</h3>
          <div class="flex items-center space-x-2">
            <select v-model="itemsPerPage" class="form-input" style="width: auto;" @change="applyFilters">
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <div v-if="loading" class="flex justify-center py-12">
          <div class="loading-spinner"></div>
        </div>
        
        <div v-else-if="filteredLeads.length === 0" class="empty-state">
          <Icon name="heroicons:users" class="empty-state-icon" />
          <h3 class="empty-state-title">No leads found</h3>
          <p class="empty-state-description">
            Get started by creating your first lead
          </p>
          <div class="mt-6">
            <NuxtLink to="/leads/new" class="btn btn-primary">
              <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
              Add Lead
            </NuxtLink>
          </div>
        </div>

        <div v-else class="table-container relative">
          <!-- Scroll indicator -->
          <div class="absolute top-0 right-0 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-bl-lg z-10">
            ← Scroll horizontally →
          </div>
          <table class="table">
            <thead class="table-header">
              <tr>
                <th class="table-header-cell w-12">
                  <input 
                    type="checkbox" 
                    :checked="selectedLeads.length === filteredLeads.length"
                    @change="toggleAllSelection"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th class="table-header-cell cursor-pointer" @click="sortBy('firstName')">
                  <div class="flex items-center">
                    Name
                    <Icon 
                      :name="getSortIcon('firstName')" 
                      class="w-4 h-4 ml-1" 
                    />
                  </div>
                </th>
                <th class="table-header-cell">Company</th>
                <th class="table-header-cell cursor-pointer" @click="sortBy('status')">
                  <div class="flex items-center">
                    Status
                    <Icon 
                      :name="getSortIcon('status')" 
                      class="w-4 h-4 ml-1" 
                    />
                  </div>
                </th>
                <th class="table-header-cell cursor-pointer" @click="sortBy('priority')">
                  <div class="flex items-center">
                    Priority
                    <Icon 
                      :name="getSortIcon('priority')" 
                      class="w-4 h-4 ml-1" 
                    />
                  </div>
                </th>
                <th class="table-header-cell cursor-pointer" @click="sortBy('value')">
                  <div class="flex items-center">
                    Value
                    <Icon 
                      :name="getSortIcon('value')" 
                      class="w-4 h-4 ml-1" 
                    />
                  </div>
                </th>
                <th class="table-header-cell">Follow-up</th>
                <th class="table-header-cell">AI Score</th>
                <th class="table-header-cell cursor-pointer" @click="sortBy('createdAt')">
                  <div class="flex items-center">
                    Created
                    <Icon 
                      :name="getSortIcon('createdAt')" 
                      class="w-4 h-4 ml-1" 
                    />
                  </div>
                </th>
                <th class="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="lead in paginatedLeads" :key="lead._id" class="table-row">
                <td class="table-cell">
                  <input 
                    type="checkbox" 
                    :checked="selectedLeads.includes(lead._id)"
                    @change="toggleLeadSelection(lead._id)"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td class="table-cell-name">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8">
                      <div class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                        {{ lead.firstName.charAt(0) }}{{ lead.lastName.charAt(0) }}
                      </div>
                    </div>
                    <div class="ml-3 min-w-0 flex-1">
                      <div class="text-sm font-medium text-gray-900 truncate">
                        {{ lead.firstName }} {{ lead.lastName }}
                      </div>
                      <div class="text-xs text-gray-500 truncate">{{ lead.email }}</div>
                      <div class="text-xs text-gray-400 truncate">{{ lead.phone || 'No phone' }}</div>
                    </div>
                  </div>
                </td>
                <td class="table-cell-company">
                  <div class="text-sm text-gray-900 truncate">{{ lead.company || 'N/A' }}</div>
                  <div class="text-xs text-gray-500 truncate">{{ lead.jobTitle || 'N/A' }}</div>
                  <div class="text-xs text-gray-400 truncate">{{ lead.industry || 'N/A' }}</div>
                </td>
                <td class="table-cell">
                  <select 
                    :value="lead.status" 
                    @change="updateLeadStatus(lead._id, $event.target.value)"
                    :class="['badge', getStatusClass(lead.status), 'cursor-pointer']"
                    class="border-0 bg-transparent text-xs font-medium"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </td>
                <td class="table-cell">
                  <select 
                    :value="lead.priority" 
                    @change="updateLeadPriority(lead._id, $event.target.value)"
                    :class="['badge', getPriorityClass(lead.priority), 'cursor-pointer']"
                    class="border-0 bg-transparent text-xs font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </td>
                <td class="table-cell">
                  <div class="text-sm text-gray-900">
                    {{ lead.value ? `$${formatNumber(lead.value)}` : 'N/A' }}
                  </div>
                  <div class="text-sm text-gray-500">{{ lead.currency }}</div>
                </td>
                <td class="table-cell">
                  <div v-if="lead.nextFollowUpDate" class="text-sm">
                    <div class="text-gray-900">{{ formatDate(lead.nextFollowUpDate) }}</div>
                    <div class="text-xs text-gray-500">{{ getTimeUntilFollowUp(lead.nextFollowUpDate) }}</div>
                  </div>
                  <button 
                    v-else
                    @click="scheduleFollowUp(lead._id)"
                    class="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Schedule
                  </button>
                </td>
                <td class="table-cell">
                  <div v-if="lead.aiScore" class="flex items-center">
                    <span :class="['ai-score', getAIScoreClass(lead.aiScore)]">
                      {{ lead.aiScore }}/100
                    </span>
                  </div>
                  <button 
                    v-else
                    @click="analyzeLead(lead._id)"
                    class="text-purple-600 hover:text-purple-900 text-sm font-medium"
                  >
                    Analyze
                  </button>
                </td>
                <td class="table-cell">
                  <div class="text-sm text-gray-900">{{ formatDate(lead.createdAt) }}</div>
                  <div class="text-xs text-gray-500">{{ getTimeAgo(lead.createdAt) }}</div>
                </td>
                <td class="table-cell-actions">
                  <div class="flex items-center space-x-1">
                    <button 
                      @click="viewLead(lead._id)"
                      class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="View Details"
                    >
                      <Icon name="heroicons:eye" class="w-4 h-4" />
                    </button>
                    <button 
                      @click="editLead(lead._id)"
                      class="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      title="Edit Lead"
                    >
                      <Icon name="heroicons:pencil" class="w-4 h-4" />
                    </button>
                    <button 
                      @click="scheduleFollowUp(lead._id)"
                      class="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                      title="Schedule Follow-up"
                    >
                      <Icon name="heroicons:clock" class="w-4 h-4" />
                    </button>
                    <button 
                      @click="deleteLead(lead._id)"
                      class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Delete Lead"
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
      <div v-if="totalPages > 1" class="card-footer">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredLeads.length) }} of {{ filteredLeads.length }} results
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
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="btn btn-outline btn-sm"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Follow-up Modal -->
    <Teleport to="body">
      <div v-if="showFollowUpModal" class="followup-modal">
        <div class="modal-overlay" @click="closeFollowUpModal"></div>
        <div class="modal-container" @click.stop>
          <div class="modal-content">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Schedule Follow-up</h3>
            </div>
            <div class="px-6 py-4">
              <form @submit.prevent="saveFollowUp">
                <div class="mb-4">
                  <label class="form-label">Follow-up Date</label>
                  <input
                    v-model="followUpData.date"
                    type="datetime-local"
                    class="form-input"
                    required
                  />
                </div>
                <div class="mb-4">
                  <label class="form-label">Type</label>
                  <select v-model="followUpData.type" class="form-input" required>
                    <option value="call">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="note">Note</option>
                  </select>
                </div>
                <div class="mb-4">
                  <label class="form-label">Notes</label>
                  <textarea
                    v-model="followUpData.notes"
                    class="form-input"
                    rows="3"
                    placeholder="Add follow-up notes..."
                  ></textarea>
                </div>
                <div class="flex justify-end space-x-3">
                  <button type="button" @click="closeFollowUpModal" class="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary">
                    Schedule Follow-up
                  </button>
                </div>
              </form>
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
const showFilters = ref(false)
const showAIFollowUps = ref(false)
const showFollowUpModal = ref(false)
const leads = ref([])
const selectedLeads = ref([])
const currentPage = ref(1)
const itemsPerPage = ref(10)
const sortField = ref('createdAt')
const sortOrder = ref('desc')

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false
})

const filters = ref({
  search: '',
  status: '',
  priority: '',
  source: ''
})

const followUpData = ref({
  leadId: null,
  date: '',
  type: 'call',
  notes: ''
})

const stats = ref({
  totalLeads: 0,
  qualifiedLeads: 0,
  pendingFollowUps: 0,
  totalValue: 0
})

const aiFollowUpSuggestions = ref([
  {
    id: 1,
    leadId: 'lead1',
    leadName: 'John Doe',
    priority: 'high',
    suggestion: 'Follow up on the proposal sent last week. Lead showed high interest in enterprise features.'
  },
  {
    id: 2,
    leadId: 'lead2',
    leadName: 'Jane Smith',
    priority: 'medium',
    suggestion: 'Schedule a demo call. Lead mentioned budget approval timeline next month.'
  },
  {
    id: 3,
    leadId: 'lead3',
    leadName: 'Mike Johnson',
    priority: 'urgent',
    suggestion: 'Urgent: Lead is evaluating competitors. Send case studies and schedule urgent call.'
  }
])

// Computed properties
const filteredLeads = computed(() => {
  let filtered = leads.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(lead => 
      lead.firstName.toLowerCase().includes(search) ||
      lead.lastName.toLowerCase().includes(search) ||
      lead.email.toLowerCase().includes(search) ||
      (lead.company && lead.company.toLowerCase().includes(search))
    )
  }

  if (filters.value.status) {
    filtered = filtered.filter(lead => lead.status === filters.value.status)
  }

  if (filters.value.priority) {
    filtered = filtered.filter(lead => lead.priority === filters.value.priority)
  }

  if (filters.value.source) {
    filtered = filtered.filter(lead => lead.source === filters.value.source)
  }

  // Sort
  filtered.sort((a, b) => {
    let aVal = a[sortField.value]
    let bVal = b[sortField.value]

    if (sortField.value === 'firstName') {
      aVal = `${a.firstName} ${a.lastName}`
      bVal = `${b.firstName} ${b.lastName}`
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return filtered
})

const paginatedLeads = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredLeads.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredLeads.value.length / itemsPerPage.value)
})

// Methods
const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const getTimeAgo = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

const getTimeUntilFollowUp = (date) => {
  const now = new Date()
  const followUp = new Date(date)
  const diff = followUp - now
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days < 0) return 'Overdue'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `In ${days} days`
}

const getStatusClass = (status) => {
  const classes = {
    new: 'status-new',
    contacted: 'status-contacted',
    qualified: 'status-qualified',
    proposal: 'status-proposal',
    negotiation: 'status-negotiation',
    closed_won: 'status-closed-won',
    closed_lost: 'status-closed-lost'
  }
  return classes[status] || 'badge-gray'
}

const getPriorityClass = (priority) => {
  const classes = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
    urgent: 'priority-urgent'
  }
  return classes[priority] || 'badge-gray'
}

const getAIScoreClass = (score) => {
  if (score >= 70) return 'ai-score-high'
  if (score >= 40) return 'ai-score-medium'
  return 'ai-score-low'
}

const getSortIcon = (field) => {
  if (sortField.value !== field) return 'heroicons:bars-arrow-up'
  return sortOrder.value === 'asc' ? 'heroicons:bars-arrow-up' : 'heroicons:bars-arrow-down'
}

const loadLeads = async () => {
  try {
    loading.value = true
    
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      ...Object.fromEntries(Object.entries(filters.value).filter(([_, v]) => v))
    })
    
    // Get authentication token
    const token = useCookie('auth-token')
    
    // Fallback to localStorage if cookie is not available
    if (!token.value && process.client) {
      const localToken = localStorage.getItem('auth-token')
      if (localToken) {
        token.value = localToken
      }
    }
    
    const headers = token.value ? { 'Authorization': `Bearer ${token.value}` } : {}
    
    const response = await $fetch(`/api/leads?${params}`, {
      headers
    })
    
    if (response.success) {
      leads.value = response.data
      pagination.value = response.pagination
      updateStats()
    }
  } catch (error) {
    console.error('Error loading leads:', error)
  } finally {
    loading.value = false
  }
}

const updateStats = () => {
  stats.value.totalLeads = leads.value.length
  stats.value.qualifiedLeads = leads.value.filter(lead => lead.status === 'qualified').length
  stats.value.pendingFollowUps = leads.value.filter(lead => !lead.nextFollowUpDate).length
  stats.value.totalValue = leads.value.reduce((sum, lead) => sum + (lead.value || 0), 0)
}

const applyFilters = () => {
  currentPage.value = 1
  loadLeads()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    status: '',
    priority: '',
    source: ''
  }
  applyFilters()
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

const toggleAllSelection = () => {
  if (selectedLeads.value.length === filteredLeads.value.length) {
    selectedLeads.value = []
  } else {
    selectedLeads.value = filteredLeads.value.map(lead => lead._id)
  }
}

const toggleLeadSelection = (leadId) => {
  const index = selectedLeads.value.indexOf(leadId)
  if (index > -1) {
    selectedLeads.value.splice(index, 1)
  } else {
    selectedLeads.value.push(leadId)
  }
}

const clearSelection = () => {
  selectedLeads.value = []
}

const updateLeadStatus = async (leadId, status) => {
  try {
    const token = useCookie('auth-token')
    const response = await $fetch(`/api/leads/${leadId}`, {
      method: 'PUT',
      headers: token.value ? { 'Authorization': `Bearer ${token.value}` } : {},
      body: { status }
    })
    
    if (response.success) {
      const lead = leads.value.find(l => l._id === leadId)
      if (lead) {
        lead.status = status
        updateStats()
      }
    }
  } catch (error) {
    console.error('Error updating lead status:', error)
  }
}

const updateLeadPriority = async (leadId, priority) => {
  try {
    const token = useCookie('auth-token')
    const response = await $fetch(`/api/leads/${leadId}`, {
      method: 'PUT',
      headers: token.value ? { 'Authorization': `Bearer ${token.value}` } : {},
      body: { priority }
    })
    
    if (response.success) {
      const lead = leads.value.find(l => l._id === leadId)
      if (lead) {
        lead.priority = priority
      }
    }
  } catch (error) {
    console.error('Error updating lead priority:', error)
  }
}

const scheduleFollowUp = (leadId, suggestion = '') => {
  console.log('Scheduling follow-up for lead:', leadId)
  followUpData.value = {
    leadId,
    date: '',
    type: 'call',
    notes: suggestion
  }
  showFollowUpModal.value = true
}

const saveFollowUp = async () => {
  try {
    console.log('Scheduling follow-up with data:', followUpData.value)
    
    // Validate required fields
    if (!followUpData.value.leadId) {
      alert('Error: Lead ID is missing')
      return
    }
    
    if (!followUpData.value.date) {
      alert('Error: Please select a follow-up date')
      return
    }
    
    // Get authentication token
    const token = useCookie('auth-token')
    
    // Fallback to localStorage if cookie is not available
    if (!token.value && process.client) {
      const localToken = localStorage.getItem('auth-token')
      if (localToken) {
        token.value = localToken
      }
    }
    
    if (!token.value) {
      alert('Error: Authentication required. Please login again.')
      return
    }
    
    const response = await $fetch('/api/activities', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: {
        type: followUpData.value.type,
        title: 'Follow-up Scheduled',
        description: followUpData.value.notes,
        leadId: followUpData.value.leadId,
        dueDate: followUpData.value.date
      }
    })
    
    if (response.success) {
      closeFollowUpModal()
      // Update lead with follow-up date
      const lead = leads.value.find(l => l._id === followUpData.value.leadId)
      if (lead) {
        lead.nextFollowUpDate = followUpData.value.date
      }
      // Reload leads to get updated data
      await loadLeads()
      alert('Follow-up scheduled successfully!')
    }
  } catch (error) {
    console.error('Error scheduling follow-up:', error)
    console.error('Error details:', {
      status: error.status,
      statusText: error.statusText,
      data: error.data,
      message: error.message
    })
    alert(`Error scheduling follow-up: ${error.data?.message || error.message || 'Unknown error'}`)
  }
}

const closeFollowUpModal = () => {
  showFollowUpModal.value = false
  followUpData.value = {
    leadId: null,
    date: '',
    type: 'call',
    notes: ''
  }
}

const viewLead = (leadId) => {
  // For now, show lead details in a modal or alert
  const lead = leads.value.find(l => l._id === leadId)
  if (lead) {
    const details = `
Name: ${lead.firstName} ${lead.lastName}
Email: ${lead.email}
Phone: ${lead.phone || 'N/A'}
Company: ${lead.company || 'N/A'}
Job Title: ${lead.jobTitle || 'N/A'}
Industry: ${lead.industry || 'N/A'}
Status: ${lead.status}
Priority: ${lead.priority}
Value: $${lead.value || 0} ${lead.currency || 'USD'}
Source: ${lead.source || 'N/A'}
Created: ${formatDate(lead.createdAt)}
Next Follow-up: ${lead.nextFollowUpDate ? formatDate(lead.nextFollowUpDate) : 'Not scheduled'}
AI Score: ${lead.aiScore || 'Not analyzed'}
    `.trim()
    alert(details)
  }
}

const editLead = (leadId) => {
  // For now, redirect to new lead page with pre-filled data
  const lead = leads.value.find(l => l._id === leadId)
  if (lead) {
    navigateTo(`/leads/new?edit=${leadId}`)
  }
}

const deleteLead = async (leadId) => {
  if (confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
    try {
      const token = useCookie('auth-token')
      const response = await $fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: token.value ? { 'Authorization': `Bearer ${token.value}` } : {}
      })
      
      if (response.success) {
        leads.value = leads.value.filter(lead => lead._id !== leadId)
        updateStats()
        alert('Lead deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
      alert('Error deleting lead. Please try again.')
    }
  }
}

const analyzeLead = async (leadId) => {
  try {
    const token = useCookie('auth-token')
    const response = await $fetch('/api/ai/analyze-lead', {
      method: 'POST',
      headers: token.value ? { 'Authorization': `Bearer ${token.value}` } : {},
      body: { leadId }
    })
    
    if (response.success) {
      // Update the lead with AI analysis results
      const lead = leads.value.find(l => l._id === leadId)
      if (lead) {
        lead.aiScore = response.data.aiScore
        lead.sentiment = response.data.sentiment
        lead.engagement = response.data.engagement
        lead.urgency = response.data.urgency
        lead.aiInsights = response.data.insights
      }
      alert('Lead analysis completed successfully!')
    }
  } catch (error) {
    console.error('Error analyzing lead:', error)
    alert('Error analyzing lead. Please try again.')
  }
}

const exportLeads = async () => {
  try {
    const leadsToExport = selectedLeads.value.length > 0 
      ? leads.value.filter(lead => selectedLeads.value.includes(lead._id))
      : leads.value

    if (leadsToExport.length === 0) {
      alert('No leads to export')
      return
    }

    // Prepare CSV data
    const csvHeaders = [
      'Name', 'Email', 'Phone', 'Company', 'Job Title', 'Industry', 
      'Status', 'Priority', 'Value', 'Currency', 'Source', 'Created Date', 'Next Follow-up'
    ]
    
    const csvData = leadsToExport.map(lead => [
      `"${lead.firstName} ${lead.lastName}"`,
      `"${lead.email}"`,
      `"${lead.phone || 'N/A'}"`,
      `"${lead.company || 'N/A'}"`,
      `"${lead.jobTitle || 'N/A'}"`,
      `"${lead.industry || 'N/A'}"`,
      `"${lead.status}"`,
      `"${lead.priority}"`,
      `"${lead.value || 0}"`,
      `"${lead.currency || 'USD'}"`,
      `"${lead.source || 'N/A'}"`,
      `"${formatDate(lead.createdAt)}"`,
      `"${lead.nextFollowUpDate ? formatDate(lead.nextFollowUpDate) : 'N/A'}"`
    ])

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.join(','))
      .join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `leads-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    alert(`Successfully exported ${leadsToExport.length} leads`)
  } catch (error) {
    console.error('Error exporting leads:', error)
    alert('Error exporting leads. Please try again.')
  }
}

const bulkUpdateStatus = async () => {
  if (selectedLeads.value.length === 0) {
    alert('Please select leads to update')
    return
  }

  const newStatus = prompt('Enter new status (new, contacted, qualified, proposal, negotiation, closed_won, closed_lost):')
  if (!newStatus) return

  const validStatuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
  if (!validStatuses.includes(newStatus)) {
    alert('Invalid status. Please enter a valid status.')
    return
  }

  try {
    const token = useCookie('auth-token')
    const promises = selectedLeads.value.map(leadId => 
      $fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: token.value ? { 'Authorization': `Bearer ${token.value}` } : {},
        body: { status: newStatus }
      })
    )

    await Promise.all(promises)
    
    // Update local state
    selectedLeads.value.forEach(leadId => {
      const lead = leads.value.find(l => l._id === leadId)
      if (lead) lead.status = newStatus
    })
    
    updateStats()
    clearSelection()
    alert(`Successfully updated ${selectedLeads.value.length} leads to ${newStatus}`)
  } catch (error) {
    console.error('Error updating lead statuses:', error)
    alert('Error updating lead statuses. Please try again.')
  }
}

const bulkAssign = async () => {
  if (selectedLeads.value.length === 0) {
    alert('Please select leads to assign')
    return
  }

  const assignTo = prompt('Enter user email to assign leads to:')
  if (!assignTo) return

  try {
    const token = useCookie('auth-token')
    const promises = selectedLeads.value.map(leadId => 
      $fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: token.value ? { 'Authorization': `Bearer ${token.value}` } : {},
        body: { assignedTo: assignTo }
      })
    )

    await Promise.all(promises)
    clearSelection()
    alert(`Successfully assigned ${selectedLeads.value.length} leads to ${assignTo}`)
    await loadLeads() // Reload to get updated assignments
  } catch (error) {
    console.error('Error assigning leads:', error)
    alert('Error assigning leads. Please try again.')
  }
}

const bulkScheduleFollowUp = () => {
  if (selectedLeads.value.length === 0) {
    alert('Please select leads to schedule follow-up')
    return
  }

  const followUpDate = prompt('Enter follow-up date (YYYY-MM-DD):')
  if (!followUpDate) return

  const followUpType = prompt('Enter follow-up type (call, email, meeting, note):')
  if (!followUpType) return

  const followUpNotes = prompt('Enter follow-up notes (optional):') || ''

  // Schedule follow-up for all selected leads
  selectedLeads.value.forEach(leadId => {
    scheduleFollowUp(leadId, followUpNotes)
  })

  clearSelection()
}

const dismissSuggestion = (suggestionId) => {
  aiFollowUpSuggestions.value = aiFollowUpSuggestions.value.filter(s => s.id !== suggestionId)
}

// Debounced search
const debouncedSearch = debounce(() => {
  applyFilters()
}, 500)

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
onMounted(() => {
  loadLeads()
})

// Watch for filter changes
watch(filters, () => {
  if (showFilters.value) {
    applyFilters()
  }
}, { deep: true })

// Watch for page changes
watch(currentPage, () => {
  // Handle pagination
})

// Watch for items per page changes
watch(itemsPerPage, () => {
  currentPage.value = 1
  applyFilters()
})
</script>