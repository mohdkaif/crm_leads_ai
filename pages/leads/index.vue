<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="page-header">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="page-title">Leads Management</h1>
          <p class="page-subtitle">Manage and track all your leads with AI-powered insights</p>
        </div>
        <div>
          <NuxtLink to="/leads/new" class="btn btn-primary">
            <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
            Add Lead
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Action Buttons Row -->
    <div class="card mb-6">
      <div class="card-body">
        <div class="flex flex-wrap items-center gap-3">
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
            :class="{ 'bg-blue-50 text-blue-700': showFilters }"
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
          <button
            @click="openEmailComposer"
            class="btn btn-outline"
            :disabled="selectedLeads.length === 0"
          >
            <Icon name="heroicons:envelope" class="w-4 h-4 mr-2" />
            Send Email
          </button>
          <button
            @click="openAssignmentModal"
            class="btn btn-outline"
            :disabled="selectedLeads.length === 0"
          >
            <Icon name="heroicons:user-plus" class="w-4 h-4 mr-2" />
            Assign Leads
          </button>
          <button
            @click="autoAssignSelectedLeads"
            class="btn btn-outline"
            :disabled="selectedLeads.length === 0"
          >
            <Icon name="heroicons:sparkles" class="w-4 h-4 mr-2" />
            Auto Assign
          </button>
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
            <p class="stat-value">{{ formatCurrency(stats.totalValue) }}</p>
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
    <div v-if="showFilters" class="card mb-6 border-blue-200 bg-blue-50">
      <div class="card-header bg-blue-100">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <Icon name="heroicons:funnel" class="w-5 h-5 text-blue-600 mr-2" />
            <h3 class="text-lg font-semibold text-blue-900">Filter Leads</h3>
          </div>
          <button 
            @click="showFilters = false" 
            class="text-blue-600 hover:text-blue-800"
          >
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
      </div>
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
              <Icon name="heroicons:x-mark" class="w-4 h-4 mr-1" />
              Clear Filters
            </button>
            <button @click="applyFilters" class="btn btn-primary btn-sm">
              <Icon name="heroicons:check" class="w-4 h-4 mr-1" />
              Apply Filters
            </button>
          </div>
          <div class="text-sm text-blue-700 font-medium">
            {{ filteredLeads.length }} of {{ leads.length }} leads
          </div>
        </div>
      </div>
    </div>

    <!-- Leads Table -->
    <div class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <Icon name="heroicons:users" class="w-5 h-5 text-gray-600 mr-2" />
            <h3 class="text-lg font-semibold text-gray-900">All Leads</h3>
            <span class="ml-2 text-sm text-gray-500">({{ filteredLeads.length }} total)</span>
          </div>
          <div class="flex items-center space-x-2">
            <label class="text-sm text-gray-600 mr-2">Show:</label>
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
                    {{ lead.value ? formatCurrency(lead.value, lead.currency) : 'N/A' }}
                  </div>
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
                  <div class="text-xs text-gray-500">{{ getRelativeTime(lead.createdAt) }}</div>
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
                      @click="sendEmailToLead(lead._id)"
                      class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Send Email"
                    >
                      <Icon name="heroicons:envelope" class="w-4 h-4" />
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

    <!-- Email Composer -->
    <EmailComposer 
      :show="showEmailComposer" 
      :lead-id="selectedLeadId"
      @close="closeEmailComposer"
      @sent="handleEmailSent"
    />

    <!-- Assignment Modal -->
    <Teleport to="body">
      <div v-if="showAssignmentModal" class="assignment-modal">
        <div class="modal-overlay" @click="closeAssignmentModal"></div>
        <div class="modal-container max-w-md" @click.stop>
          <div class="modal-content">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-gray-900">Assign Leads</h3>
              <button @click="closeAssignmentModal" class="text-gray-400 hover:text-gray-600">
                <Icon name="heroicons:x-mark" class="w-6 h-6" />
              </button>
            </div>
            
            <div class="card-body">
              <div class="mb-4">
                <p class="text-sm text-gray-600 mb-2">
                  Assigning <strong>{{ selectedLeads.length }}</strong> selected leads
                </p>
              </div>
              
              <div class="mb-4">
                <label class="form-label">Assign to User *</label>
                <select v-model="assignmentForm.userId" class="form-input" required>
                  <option value="">Select user</option>
                  <option v-for="user in users" :key="user._id" :value="user._id">
                    {{ user.firstName }} {{ user.lastName }} ({{ user.role }})
                  </option>
                </select>
              </div>
              
              <div class="mb-4">
                <label class="form-label">Assignment Notes</label>
                <textarea 
                  v-model="assignmentForm.notes" 
                  class="form-input" 
                  rows="3"
                  placeholder="Enter assignment notes (optional)"
                ></textarea>
              </div>
            </div>
            
            <div class="card-footer">
              <div class="flex justify-end space-x-2">
                <button @click="closeAssignmentModal" class="btn btn-outline">Cancel</button>
                <button @click="assignSelectedLeads" class="btn btn-primary">
                  Assign Leads
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
// Use settings composable
const { 
  formatCurrency, 
  formatDate, 
  formatDateTime, 
  getRelativeTime, 
  getCompanyName,
  shouldNotify 
} = useSettings()

// Use auth composable
const { fetchUser } = useAuth()

// Reactive data
const loading = ref(true)
const showFilters = ref(false)
const showAIFollowUps = ref(false)
const showFollowUpModal = ref(false)
const showEmailComposer = ref(false)
const showAssignmentModal = ref(false)
const selectedLeadId = ref('')
const users = ref([])
const assignmentForm = ref({
  userId: '',
  notes: ''
})
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
    const { warning: showWarning } = useAlert()
    if (!followUpData.value.leadId) {
      await showWarning('Validation Error', 'Lead ID is missing')
      return
    }
    
    if (!followUpData.value.date) {
      await showWarning('Validation Error', 'Please select a follow-up date')
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
      const { error: showError } = useAlert()
      await showError('Authentication Required', 'Please login again.')
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
      const { success } = useAlert()
      await success('Follow-up scheduled successfully!')
    }
  } catch (error) {
    console.error('Error scheduling follow-up:', error)
    console.error('Error details:', {
      status: error.status,
      statusText: error.statusText,
      data: error.data,
      message: error.message
    })
    const { error: showError } = useAlert()
    await showError('Error scheduling follow-up', error.data?.message || error.message || 'Unknown error')
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

const viewLead = async (leadId) => {
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
    const { info } = useAlert()
    await info('Lead Details', details)
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
  const { confirm } = useAlert()
  const result = await confirm('Delete Lead', 'Are you sure you want to delete this lead? This action cannot be undone.', 'Yes, Delete', 'Cancel')
  if (result.isConfirmed) {
    try {
      const token = useCookie('auth-token')
      const response = await $fetch(`/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: token.value ? { 'Authorization': `Bearer ${token.value}` } : {}
      })
      
      if (response.success) {
        leads.value = leads.value.filter(lead => lead._id !== leadId)
        updateStats()
        const { success } = useAlert()
        await success('Lead deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
      const { error: showError } = useAlert()
      await showError('Error deleting lead', 'Please try again.')
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
      const { success } = useAlert()
      await success('Lead analysis completed successfully!')
    }
  } catch (error) {
    console.error('Error analyzing lead:', error)
    const { error: showError } = useAlert()
    await showError('Error analyzing lead', 'Please try again.')
  }
}

const exportLeads = async () => {
  try {
    const leadsToExport = selectedLeads.value.length > 0 
      ? leads.value.filter(lead => selectedLeads.value.includes(lead._id))
      : leads.value

    if (leadsToExport.length === 0) {
      const { warning } = useAlert()
      await warning('No leads to export')
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

    const { success } = useAlert()
    await success(`Successfully exported ${leadsToExport.length} leads`)
  } catch (error) {
    console.error('Error exporting leads:', error)
    const { error: showError } = useAlert()
    await showError('Error exporting leads', 'Please try again.')
  }
}

const bulkUpdateStatus = async () => {
  if (selectedLeads.value.length === 0) {
    const { warning } = useAlert()
    await warning('Please select leads to update')
    return
  }

  const newStatus = prompt('Enter new status (new, contacted, qualified, proposal, negotiation, closed_won, closed_lost):')
  if (!newStatus) return

  const validStatuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
  if (!validStatuses.includes(newStatus)) {
    const { warning } = useAlert()
    await warning('Invalid status', 'Please enter a valid status.')
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
    const { success } = useAlert()
    await success(`Successfully updated ${selectedLeads.value.length} leads to ${newStatus}`)
  } catch (error) {
    console.error('Error updating lead statuses:', error)
    const { error: showError } = useAlert()
    await showError('Error updating lead statuses', 'Please try again.')
  }
}

const bulkAssign = async () => {
  if (selectedLeads.value.length === 0) {
    const { warning } = useAlert()
    await warning('Please select leads to assign')
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
    const { success } = useAlert()
    await success(`Successfully assigned ${selectedLeads.value.length} leads to ${assignTo}`)
    await loadLeads() // Reload to get updated assignments
  } catch (error) {
    console.error('Error assigning leads:', error)
    const { error: showError } = useAlert()
    await showError('Error assigning leads', 'Please try again.')
  }
}

const bulkScheduleFollowUp = async () => {
  if (selectedLeads.value.length === 0) {
    const { warning } = useAlert()
    await warning('Please select leads to schedule follow-up')
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

// Email methods
const openEmailComposer = () => {
  if (selectedLeads.value.length === 1) {
    selectedLeadId.value = selectedLeads.value[0]
  } else {
    selectedLeadId.value = ''
  }
  showEmailComposer.value = true
}

const sendEmailToLead = (leadId) => {
  selectedLeadId.value = leadId
  showEmailComposer.value = true
}

const closeEmailComposer = () => {
  showEmailComposer.value = false
  selectedLeadId.value = ''
}

const handleEmailSent = (data) => {
  console.log('Email sent:', data)
  // Refresh leads to show updated last contact date
  loadLeads()
}

// Assignment methods
const loadUsers = async () => {
  try {
    const { fetchUser } = useAuth()
    const currentUser = await fetchUser()
    
    if (!currentUser) {
      throw new Error('Authentication required')
    }

    const response = await $fetch('/api/users')

    if (response.success) {
      users.value = response.data.users.filter(user => 
        ['sales', 'manager'].includes(user.role)
      )
      console.log('Loaded users:', users.value.length, users.value)
    } else {
      console.error('Failed to load users:', response)
      throw new Error('Failed to load users')
    }
  } catch (err) {
    console.error('Error loading users:', err)
    const { error: showError } = useAlert()
    await showError('Failed to load users', 'Please try again.')
  }
}

const openAssignmentModal = () => {
  assignmentForm.value = {
    userId: '',
    notes: ''
  }
  showAssignmentModal.value = true
}

const closeAssignmentModal = () => {
  showAssignmentModal.value = false
  assignmentForm.value = {
    userId: '',
    notes: ''
  }
}

const assignSelectedLeads = async () => {
  if (!assignmentForm.value.userId) {
    const { warning } = useAlert()
    await warning('Please select a user to assign leads to')
    return
  }

  try {
    const token = useCookie('auth-token')
    let authToken = token.value
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }
    if (!authToken) {
      throw new Error('Authentication required')
    }

    // Assign each selected lead
    for (const leadId of selectedLeads.value) {
      await $fetch('/api/assignments/manual-assign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: {
          leadId,
          userId: assignmentForm.value.userId,
          notes: assignmentForm.value.notes
        }
      })
    }

    closeAssignmentModal()
    selectedLeads.value = []
    loadLeads()
    const { success } = useAlert()
    await success('Leads assigned successfully!')
  } catch (err) {
    console.error('Error assigning leads:', err)
    const { error: showError } = useAlert()
    await showError('Failed to assign leads', err.data?.message || err.message || 'Please try again')
  }
}

const autoAssignSelectedLeads = async () => {
  try {
    const token = useCookie('auth-token')
    let authToken = token.value
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }
    if (!authToken) {
      throw new Error('Authentication required')
    }

    // Auto assign each selected lead
    for (const leadId of selectedLeads.value) {
      await $fetch('/api/assignments/auto-assign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: { leadId }
      })
    }

    selectedLeads.value = []
    loadLeads()
    const { success } = useAlert()
    await success('Leads auto-assigned successfully!')
  } catch (err) {
    console.error('Error auto-assigning leads:', err)
    const { error: showError } = useAlert()
    await showError('Failed to auto-assign leads', err.data?.message || err.message || 'Please try again')
  }
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
  loadUsers()
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

<style scoped>
/* Modal Styles */
.followup-modal,
.assignment-modal {
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
  position: relative;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-body {
  padding: 1.5rem;
}

.card-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.form-input {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.btn-primary {
  color: white;
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.btn-primary:hover {
  background-color: #2563eb;
  border-color: #2563eb;
}

.btn-outline {
  color: #374151;
  background-color: white;
  border-color: #d1d5db;
}

.btn-outline:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}
</style>