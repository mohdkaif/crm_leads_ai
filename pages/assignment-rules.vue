<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Assignment Rules</h1>
        <p class="text-gray-600">Configure automatic lead assignment rules based on region, skills, and availability</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card bg-red-50 border-red-200">
        <div class="card-body text-center">
          <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Rules</h3>
          <p class="text-red-700 mb-4">{{ error }}</p>
          <button @click="loadRules" class="btn btn-primary">
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
                    <Icon name="heroicons:cog-6-tooth" class="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Rules</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.totalRules }}</p>
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
                  <p class="text-sm font-medium text-gray-500">Active Rules</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.activeRules }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Icon name="heroicons:pause-circle" class="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Inactive Rules</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ stats.inactiveRules }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between items-center">
          <div class="flex space-x-4">
            <button @click="openCreateModal" class="btn btn-primary">
              <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
              Create Rule
            </button>
            <button @click="loadRules" class="btn btn-outline">
              <Icon name="heroicons:arrow-path" class="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>
          
          <div class="flex space-x-2">
            <select v-model="selectedStatus" @change="filterRules" class="form-input">
              <option value="">All Rules</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <input 
              v-model="searchQuery" 
              @input="debouncedSearch" 
              type="text" 
              placeholder="Search rules..." 
              class="form-input"
            />
          </div>
        </div>

        <!-- Rules List -->
        <div class="card">
          <div class="card-body p-0">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rule Name
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment Type
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conditions
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="rule in rules" :key="rule._id" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ rule.name }}</div>
                        <div class="text-sm text-gray-500">{{ rule.description || 'No description' }}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{ formatAssignmentType(rule.assignment.type) }}
                      </div>
                      <div v-if="rule.assignment.userId" class="text-sm text-gray-500">
                        {{ rule.assignment.userId.firstName }} {{ rule.assignment.userId.lastName }}
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-900">
                        <div v-if="rule.conditions.regions?.length" class="mb-1">
                          <span class="font-medium">Regions:</span> {{ rule.conditions.regions.join(', ') }}
                        </div>
                        <div v-if="rule.conditions.leadSources?.length" class="mb-1">
                          <span class="font-medium">Sources:</span> {{ rule.conditions.leadSources.join(', ') }}
                        </div>
                        <div v-if="rule.conditions.leadValue" class="mb-1">
                          <span class="font-medium">Value:</span> ${{ rule.conditions.leadValue.min || 0 }} - ${{ rule.conditions.leadValue.max || '∞' }}
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="badge bg-blue-100 text-blue-800">
                        {{ rule.priority }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span v-if="rule.isActive" class="badge bg-green-100 text-green-800">
                        Active
                      </span>
                      <span v-else class="badge bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <button 
                          @click="editRule(rule)" 
                          class="text-blue-600 hover:text-blue-900"
                          title="Edit Rule"
                        >
                          <Icon name="heroicons:pencil" class="w-4 h-4" />
                        </button>
                        <button 
                          @click="toggleRuleStatus(rule)" 
                          :class="rule.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'"
                          :title="rule.isActive ? 'Deactivate Rule' : 'Activate Rule'"
                        >
                          <Icon :name="rule.isActive ? 'heroicons:pause' : 'heroicons:play'" class="w-4 h-4" />
                        </button>
                        <button 
                          @click="deleteRule(rule._id)" 
                          class="text-red-600 hover:text-red-900"
                          title="Delete Rule"
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
        <div v-if="rules.length === 0" class="empty-state">
          <Icon name="heroicons:cog-6-tooth" class="empty-state-icon" />
          <h3 class="empty-state-title">No assignment rules found</h3>
          <p class="empty-state-description">
            Create your first assignment rule to automatically assign leads to sales reps.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Create/Edit Rule Modal -->
    <Teleport to="body">
      <div v-if="showRuleModal" class="rule-modal">
        <div class="modal-overlay" @click="closeRuleModal"></div>
        <div class="modal-container max-w-4xl" @click.stop>
        <div class="modal-content">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ isEditMode ? 'Edit Assignment Rule' : 'Create Assignment Rule' }}
            </h3>
            <button @click="closeRuleModal" class="text-gray-400 hover:text-gray-600">
              <Icon name="heroicons:x-mark" class="w-6 h-6" />
            </button>
          </div>
          
          <div class="card-body">
            <form @submit.prevent="saveRule">
              <!-- Basic Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label class="form-label">Rule Name *</label>
                  <input 
                    v-model="ruleForm.name" 
                    type="text" 
                    class="form-input" 
                    placeholder="Enter rule name"
                    required
                  />
                </div>
                <div>
                  <label class="form-label">Priority</label>
                  <input 
                    v-model.number="ruleForm.priority" 
                    type="number" 
                    class="form-input" 
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>

              <div class="mb-6">
                <label class="form-label">Description</label>
                <textarea 
                  v-model="ruleForm.description" 
                  class="form-input" 
                  rows="3"
                  placeholder="Enter rule description"
                ></textarea>
              </div>

              <!-- Assignment Type -->
              <div class="mb-6">
                <label class="form-label">Assignment Type *</label>
                <select v-model="ruleForm.assignment.type" class="form-input" required>
                  <option value="">Select assignment type</option>
                  <option value="round_robin">Round Robin</option>
                  <option value="least_assigned">Least Assigned</option>
                  <option value="most_available">Most Available</option>
                  <option value="specific_user">Specific User</option>
                  <option value="skill_based">Skill Based</option>
                </select>
              </div>

              <!-- Specific User Selection -->
              <div v-if="ruleForm.assignment.type === 'specific_user'" class="mb-6">
                <label class="form-label">Assign to User *</label>
                <select v-model="ruleForm.assignment.userId" class="form-input" required>
                  <option value="">Select user</option>
                  <option v-for="user in users" :key="user._id" :value="user._id">
                    {{ user.firstName }} {{ user.lastName }} ({{ user.role }})
                  </option>
                </select>
              </div>

              <!-- Skill Requirements -->
              <div v-if="ruleForm.assignment.type === 'skill_based'" class="mb-6">
                <label class="form-label">Required Skills *</label>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="skill in availableSkills" 
                    :key="skill"
                    @click="toggleSkill(skill)"
                    class="badge cursor-pointer"
                    :class="ruleForm.assignment.skillRequirements?.includes(skill) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>

              <!-- Conditions -->
              <div class="mb-6">
                <h4 class="text-lg font-semibold text-gray-900 mb-4">Conditions</h4>
                
                <!-- Regions -->
                <div class="mb-4">
                  <label class="form-label">Regions</label>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-for="region in availableRegions" 
                      :key="region"
                      @click="toggleRegion(region)"
                      class="badge cursor-pointer"
                      :class="ruleForm.conditions.regions?.includes(region) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'"
                    >
                      {{ region }}
                    </span>
                  </div>
                </div>

                <!-- Lead Sources -->
                <div class="mb-4">
                  <label class="form-label">Lead Sources</label>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-for="source in availableSources" 
                      :key="source"
                      @click="toggleSource(source)"
                      class="badge cursor-pointer"
                      :class="ruleForm.conditions.leadSources?.includes(source) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'"
                    >
                      {{ source }}
                    </span>
                  </div>
                </div>

                <!-- Lead Value Range -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Minimum Lead Value</label>
                    <input 
                      v-model.number="ruleForm.conditions.leadValue.min" 
                      type="number" 
                      class="form-input" 
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label class="form-label">Maximum Lead Value</label>
                    <input 
                      v-model.number="ruleForm.conditions.leadValue.max" 
                      type="number" 
                      class="form-input" 
                      placeholder="No limit"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <!-- Assignment Limits -->
              <div class="mb-6">
                <h4 class="text-lg font-semibold text-gray-900 mb-4">Assignment Limits</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Max Leads Per Day</label>
                    <input 
                      v-model.number="ruleForm.assignment.maxLeadsPerDay" 
                      type="number" 
                      class="form-input" 
                      placeholder="10"
                      min="1"
                    />
                  </div>
                  <div>
                    <label class="form-label">Max Leads Per Week</label>
                    <input 
                      v-model.number="ruleForm.assignment.maxLeadsPerWeek" 
                      type="number" 
                      class="form-input" 
                      placeholder="50"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <!-- Status -->
              <div class="mb-6">
                <label class="flex items-center">
                  <input 
                    v-model="ruleForm.isActive" 
                    type="checkbox" 
                    class="form-checkbox"
                  />
                  <span class="ml-2 text-sm text-gray-700">Active Rule</span>
                </label>
              </div>
            </form>
          </div>
          
          <div class="card-footer">
            <div class="flex justify-end space-x-2">
              <button @click="closeRuleModal" class="btn btn-outline">Cancel</button>
              <button @click="saveRule" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="loading-spinner mr-2"></span>
                {{ isEditMode ? 'Update Rule' : 'Create Rule' }}
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
const rules = ref([])
const users = ref([])
const stats = ref({
  totalRules: 0,
  activeRules: 0,
  inactiveRules: 0
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
const selectedStatus = ref('')
const searchQuery = ref('')
const currentPage = ref(1)

// Modal states
const showRuleModal = ref(false)
const isEditMode = ref(false)
const saving = ref(false)

// Form data
const ruleForm = ref({
  name: '',
  description: '',
  isActive: true,
  priority: 1,
  conditions: {
    regions: [],
    leadSources: [],
    leadValue: {
      min: null,
      max: null
    },
    leadStatus: [],
    customFields: []
  },
  assignment: {
    type: '',
    userId: '',
    skillRequirements: [],
    maxLeadsPerDay: null,
    maxLeadsPerWeek: null,
    workingHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'UTC',
      workingDays: [1, 2, 3, 4, 5]
    }
  },
  fallback: {
    type: 'round_robin',
    userId: ''
  }
})

// Available options
const availableSkills = ref(['Sales', 'Marketing', 'Technical', 'Support', 'Enterprise', 'SMB'])
const availableRegions = ref(['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'])
const availableSources = ref(['Website', 'Referral', 'Cold Call', 'Email', 'Social Media', 'Trade Show', 'Partner'])

// Methods
const loadRules = async () => {
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
      search: searchQuery.value,
      isActive: selectedStatus.value
    }).toString()

    const response = await $fetch(`/api/assignment-rules?${query}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (response.success) {
      rules.value = response.data.rules
      stats.value = response.data.stats
      pagination.value = response.data.pagination
    } else {
      throw new Error('Failed to load rules')
    }
  } catch (err) {
    console.error('Error loading rules:', err)
    error.value = err.data?.message || err.message || 'Failed to load rules'
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

const filterRules = () => {
  currentPage.value = 1
  loadRules()
}

const debouncedSearch = debounce(() => {
  currentPage.value = 1
  loadRules()
}, 500)

const openCreateModal = () => {
  isEditMode.value = false
  ruleForm.value = {
    name: '',
    description: '',
    isActive: true,
    priority: 1,
    conditions: {
      regions: [],
      leadSources: [],
      leadValue: { min: null, max: null },
      leadStatus: [],
      customFields: []
    },
    assignment: {
      type: '',
      userId: '',
      skillRequirements: [],
      maxLeadsPerDay: null,
      maxLeadsPerWeek: null,
      workingHours: {
        start: '09:00',
        end: '17:00',
        timezone: 'UTC',
        workingDays: [1, 2, 3, 4, 5]
      }
    },
    fallback: {
      type: 'round_robin',
      userId: ''
    }
  }
  showRuleModal.value = true
}

const editRule = (rule) => {
  isEditMode.value = true
  ruleForm.value = {
    name: rule.name,
    description: rule.description || '',
    isActive: rule.isActive,
    priority: rule.priority,
    conditions: {
      regions: rule.conditions.regions || [],
      leadSources: rule.conditions.leadSources || [],
      leadValue: rule.conditions.leadValue || { min: null, max: null },
      leadStatus: rule.conditions.leadStatus || [],
      customFields: rule.conditions.customFields || []
    },
    assignment: {
      type: rule.assignment.type,
      userId: rule.assignment.userId?._id || '',
      skillRequirements: rule.assignment.skillRequirements || [],
      maxLeadsPerDay: rule.assignment.maxLeadsPerDay || null,
      maxLeadsPerWeek: rule.assignment.maxLeadsPerWeek || null,
      workingHours: rule.assignment.workingHours || {
        start: '09:00',
        end: '17:00',
        timezone: 'UTC',
        workingDays: [1, 2, 3, 4, 5]
      }
    },
    fallback: rule.fallback || {
      type: 'round_robin',
      userId: ''
    }
  }
  showRuleModal.value = true
}

const closeRuleModal = () => {
  showRuleModal.value = false
  isEditMode.value = false
}

const saveRule = async () => {
  try {
    saving.value = true

    const token = useCookie('auth-token')
    let authToken = token.value
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }
    if (!authToken) {
      throw new Error('Authentication required')
    }

    const url = isEditMode.value ? `/api/assignment-rules/${ruleForm.value._id}` : '/api/assignment-rules'
    const method = isEditMode.value ? 'PUT' : 'POST'

    const response = await $fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: ruleForm.value
    })

    if (response.success) {
      closeRuleModal()
      loadRules()
    } else {
      throw new Error('Failed to save rule')
    }
  } catch (err) {
    console.error('Error saving rule:', err)
    const { error: showError } = useAlert()
    await showError('Failed to save rule', err.data?.message || err.message || 'Please try again')
  } finally {
    saving.value = false
  }
}

const toggleRuleStatus = async (rule) => {
  try {
    const token = useCookie('auth-token')
    let authToken = token.value
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }
    if (!authToken) {
      throw new Error('Authentication required')
    }

    const response = await $fetch(`/api/assignment-rules/${rule._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: {
        isActive: !rule.isActive
      }
    })

    if (response.success) {
      loadRules()
    } else {
      throw new Error('Failed to update rule status')
    }
  } catch (err) {
    console.error('Error updating rule status:', err)
    const { error: showError } = useAlert()
    await showError('Failed to update rule status', err.data?.message || err.message || 'Please try again')
  }
}

const deleteRule = async (ruleId) => {
  const { confirm } = useAlert()
  const result = await confirm('Delete Rule', 'Are you sure you want to delete this rule?', 'Yes, Delete', 'Cancel')
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

    const response = await $fetch(`/api/assignment-rules/${ruleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (response.success) {
      loadRules()
    } else {
      throw new Error('Failed to delete rule')
    }
  } catch (err) {
    console.error('Error deleting rule:', err)
    const { error: showError } = useAlert()
    await showError('Failed to delete rule', err.data?.message || err.message || 'Please try again')
  }
}

const toggleSkill = (skill) => {
  if (!ruleForm.value.assignment.skillRequirements) {
    ruleForm.value.assignment.skillRequirements = []
  }
  
  const index = ruleForm.value.assignment.skillRequirements.indexOf(skill)
  if (index > -1) {
    ruleForm.value.assignment.skillRequirements.splice(index, 1)
  } else {
    ruleForm.value.assignment.skillRequirements.push(skill)
  }
}

const toggleRegion = (region) => {
  if (!ruleForm.value.conditions.regions) {
    ruleForm.value.conditions.regions = []
  }
  
  const index = ruleForm.value.conditions.regions.indexOf(region)
  if (index > -1) {
    ruleForm.value.conditions.regions.splice(index, 1)
  } else {
    ruleForm.value.conditions.regions.push(region)
  }
}

const toggleSource = (source) => {
  if (!ruleForm.value.conditions.leadSources) {
    ruleForm.value.conditions.leadSources = []
  }
  
  const index = ruleForm.value.conditions.leadSources.indexOf(source)
  if (index > -1) {
    ruleForm.value.conditions.leadSources.splice(index, 1)
  } else {
    ruleForm.value.conditions.leadSources.push(source)
  }
}

const formatAssignmentType = (type) => {
  const types = {
    'round_robin': 'Round Robin',
    'least_assigned': 'Least Assigned',
    'most_available': 'Most Available',
    'specific_user': 'Specific User',
    'skill_based': 'Skill Based'
  }
  return types[type] || type
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
  loadRules()
})

onMounted(() => {
  loadRules()
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

.rule-modal {
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

.form-checkbox {
  @apply h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded;
}
</style>
