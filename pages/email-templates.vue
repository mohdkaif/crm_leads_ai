<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Email Templates</h1>
        <p class="text-gray-600">Manage your email templates for better communication</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card bg-red-50 border-red-200">
        <div class="card-body text-center">
          <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Templates</h3>
          <p class="text-red-700 mb-4">{{ error }}</p>
          <button @click="loadTemplates" class="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-8">
        <!-- Actions -->
        <div class="flex justify-between items-center">
          <div class="flex space-x-4">
            <button @click="openCreateModal" class="btn btn-primary">
              <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
              Create Template
            </button>
            <button @click="loadTemplates" class="btn btn-outline">
              <Icon name="heroicons:arrow-path" class="w-5 h-5 mr-2" />
              Refresh
            </button>
          </div>
          
          <div class="flex space-x-2">
            <select v-model="selectedCategory" @change="filterTemplates" class="form-input">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
        </div>

        <!-- Templates Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- System Templates -->
          <div v-for="template in filteredSystemTemplates" :key="template.id" class="card">
            <div class="card-body">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ template.name }}</h3>
                  <p class="text-sm text-gray-600">{{ template.description }}</p>
                </div>
                <span class="badge bg-blue-100 text-blue-800">System</span>
              </div>
              
              <div class="mb-4">
                <p class="text-sm text-gray-500 mb-1">Category:</p>
                <span class="badge bg-gray-100 text-gray-800">{{ template.category }}</span>
              </div>
              
              <div class="mb-4">
                <p class="text-sm text-gray-500 mb-1">Subject:</p>
                <p class="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">{{ template.subject }}</p>
              </div>
              
              <div class="mb-4">
                <p class="text-sm text-gray-500 mb-1">Variables:</p>
                <div class="flex flex-wrap gap-1">
                  <span v-for="variable in template.variables" :key="variable" class="badge bg-green-100 text-green-800 text-xs">
                    {{ variable }}
                  </span>
                </div>
              </div>
              
              <div class="flex space-x-2">
                <button @click="openPreview(template)" class="btn btn-outline btn-sm">
                  <Icon name="heroicons:eye" class="w-4 h-4 mr-1" />
                  Preview
                </button>
                <button @click="useTemplate(template)" class="btn btn-primary btn-sm">
                  <Icon name="heroicons:envelope" class="w-4 h-4 mr-1" />
                  Use
                </button>
              </div>
            </div>
          </div>

          <!-- Custom Templates -->
          <div v-for="template in filteredCustomTemplates" :key="template.id" class="card">
            <div class="card-body">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ template.name }}</h3>
                  <p class="text-sm text-gray-600">{{ template.description }}</p>
                </div>
                <div class="flex space-x-2">
                  <span class="badge bg-purple-100 text-purple-800">Custom</span>
                  <button @click="editTemplate(template)" class="text-gray-400 hover:text-gray-600">
                    <Icon name="heroicons:pencil" class="w-4 h-4" />
                  </button>
                  <button @click="deleteTemplate(template.id)" class="text-red-400 hover:text-red-600">
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div class="mb-4">
                <p class="text-sm text-gray-500 mb-1">Category:</p>
                <span class="badge bg-gray-100 text-gray-800">{{ template.category }}</span>
              </div>
              
              <div class="mb-4">
                <p class="text-sm text-gray-500 mb-1">Subject:</p>
                <p class="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">{{ template.subject }}</p>
              </div>
              
              <div class="mb-4">
                <p class="text-sm text-gray-500 mb-1">Variables:</p>
                <div class="flex flex-wrap gap-1">
                  <span v-for="variable in template.variables" :key="variable" class="badge bg-green-100 text-green-800 text-xs">
                    {{ variable }}
                  </span>
                </div>
              </div>
              
              <div class="flex space-x-2">
                <button @click="openPreview(template)" class="btn btn-outline btn-sm">
                  <Icon name="heroicons:eye" class="w-4 h-4 mr-1" />
                  Preview
                </button>
                <button @click="useTemplate(template)" class="btn btn-primary btn-sm">
                  <Icon name="heroicons:envelope" class="w-4 h-4 mr-1" />
                  Use
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredTemplates.length === 0" class="empty-state">
          <Icon name="heroicons:envelope" class="empty-state-icon" />
          <h3 class="empty-state-title">No templates found</h3>
          <p class="empty-state-description">
            {{ selectedCategory ? `No templates found in ${selectedCategory} category` : 'Create your first email template to get started' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Create/Edit Template Modal -->
    <div v-if="showTemplateModal" class="modal-overlay" @click="closeTemplateModal">
      <div class="modal-container" @click.stop>
        <div class="modal-content">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ editingTemplate ? 'Edit Template' : 'Create Template' }}
            </h3>
            <button @click="closeTemplateModal" class="text-gray-400 hover:text-gray-600">
              <Icon name="heroicons:x-mark" class="w-6 h-6" />
            </button>
          </div>
          
          <div class="card-body">
            <form @submit.prevent="saveTemplate">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="form-label">Template Name *</label>
                  <input v-model="templateForm.name" type="text" class="form-input" required />
                </div>
                <div>
                  <label class="form-label">Category</label>
                  <select v-model="templateForm.category" class="form-input">
                    <option value="Custom">Custom</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Outreach">Outreach</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Thank You">Thank You</option>
                  </select>
                </div>
              </div>
              
              <div class="mb-4">
                <label class="form-label">Description</label>
                <input v-model="templateForm.description" type="text" class="form-input" />
              </div>
              
              <div class="mb-4">
                <label class="form-label">Subject *</label>
                <input v-model="templateForm.subject" type="text" class="form-input" required />
                <p class="text-xs text-gray-500 mt-1">Use {{ variableName }} for dynamic content</p>
              </div>
              
              <div class="mb-4">
                <label class="form-label">HTML Content *</label>
                <textarea v-model="templateForm.html" rows="10" class="form-input" required></textarea>
                <p class="text-xs text-gray-500 mt-1">Use {{ variableName }} for dynamic content</p>
              </div>
              
              <div class="mb-4">
                <label class="form-label">Available Variables</label>
                <div class="flex flex-wrap gap-2">
                  <span v-for="variable in availableVariables" :key="variable" 
                        class="badge bg-blue-100 text-blue-800 cursor-pointer"
                        @click="insertVariable(variable)">
                    {{ variable }}
                  </span>
                </div>
              </div>
            </form>
          </div>
          
          <div class="card-footer">
            <div class="flex justify-end space-x-2">
              <button @click="closeTemplateModal" class="btn btn-outline">Cancel</button>
              <button @click="saveTemplate" class="btn btn-primary">
                {{ editingTemplate ? 'Update' : 'Create' }} Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreviewModal" class="modal-overlay" @click="closePreviewModal">
      <div class="modal-container max-w-4xl" @click.stop>
        <div class="modal-content">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Template Preview</h3>
            <button @click="closePreviewModal" class="text-gray-400 hover:text-gray-600">
              <Icon name="heroicons:x-mark" class="w-6 h-6" />
            </button>
          </div>
          
          <div class="card-body">
            <div class="mb-4">
              <h4 class="font-semibold text-gray-900 mb-2">Subject:</h4>
              <p class="text-sm text-gray-700 font-mono bg-gray-50 p-2 rounded">{{ previewTemplate?.subject }}</p>
            </div>
            
            <div class="mb-4">
              <h4 class="font-semibold text-gray-900 mb-2">HTML Preview:</h4>
              <div class="border rounded-lg p-4 bg-white max-h-96 overflow-y-auto">
                <div v-html="previewTemplate?.html"></div>
              </div>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="flex justify-end space-x-2">
              <button @click="closePreviewModal" class="btn btn-outline">Close</button>
              <button @click="useTemplate(previewTemplate)" class="btn btn-primary">Use This Template</button>
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
const { getCompanyName } = useSettings()

// Reactive data
const loading = ref(true)
const error = ref('')
const templates = ref([])
const systemTemplates = ref([])
const customTemplates = ref([])
const categories = ref([])
const selectedCategory = ref('')

// Modal states
const showTemplateModal = ref(false)
const showPreviewModal = ref(false)
const editingTemplate = ref(null)
const previewTemplate = ref(null)

// Template form
const templateForm = ref({
  name: '',
  description: '',
  category: 'Custom',
  subject: '',
  html: ''
})

// Available variables
const availableVariables = ref([
  'leadName', 'company', 'senderName', 'leadEmail', 'leadPhone',
  'leadIndustry', 'leadValue', 'leadStatus', 'leadPriority',
  'currentDate', 'currentTime'
])

// Computed properties
const filteredSystemTemplates = computed(() => {
  if (!selectedCategory.value) return systemTemplates.value
  return systemTemplates.value.filter(t => t.category === selectedCategory.value)
})

const filteredCustomTemplates = computed(() => {
  if (!selectedCategory.value) return customTemplates.value
  return customTemplates.value.filter(t => t.category === selectedCategory.value)
})

const filteredTemplates = computed(() => [
  ...filteredSystemTemplates.value,
  ...filteredCustomTemplates.value
])

// Methods
const loadTemplates = async () => {
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

    const response = await $fetch('/api/email/templates', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (response.success) {
      systemTemplates.value = response.data.systemTemplates
      customTemplates.value = response.data.customTemplates
      categories.value = response.data.categories
    } else {
      throw new Error('Failed to load templates')
    }
  } catch (err) {
    console.error('Error loading templates:', err)
    error.value = err.data?.message || err.message || 'Failed to load templates'
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingTemplate.value = null
  templateForm.value = {
    name: '',
    description: '',
    category: 'Custom',
    subject: '',
    html: ''
  }
  showTemplateModal.value = true
}

const editTemplate = (template) => {
  editingTemplate.value = template
  templateForm.value = {
    name: template.name,
    description: template.description,
    category: template.category,
    subject: template.subject,
    html: template.html
  }
  showTemplateModal.value = true
}

const closeTemplateModal = () => {
  showTemplateModal.value = false
  editingTemplate.value = null
  templateForm.value = {
    name: '',
    description: '',
    category: 'Custom',
    subject: '',
    html: ''
  }
}

const saveTemplate = async () => {
  try {
    const token = useCookie('auth-token')
    let authToken = token.value
    if (!authToken && process.client) {
      authToken = localStorage.getItem('auth-token')
    }
    if (!authToken) {
      throw new Error('Authentication required')
    }

    const response = await $fetch('/api/email/templates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: templateForm.value
    })

    if (response.success) {
      closeTemplateModal()
      loadTemplates()
    } else {
      throw new Error('Failed to save template')
    }
  } catch (err) {
    console.error('Error saving template:', err)
    error.value = err.data?.message || err.message || 'Failed to save template'
  }
}

const deleteTemplate = async (templateId) => {
  const { confirm } = useAlert()
  const result = await confirm('Delete Template', 'Are you sure you want to delete this template?', 'Yes, Delete', 'Cancel')
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

    // Note: You'll need to create a DELETE endpoint for this
    // For now, we'll just show a message
    const { info } = useAlert()
    await info('Delete functionality will be implemented with the DELETE API endpoint')
  } catch (err) {
    console.error('Error deleting template:', err)
    error.value = err.data?.message || err.message || 'Failed to delete template'
  }
}

const openPreview = (template) => {
  previewTemplate.value = template
  showPreviewModal.value = true
}

const closePreviewModal = () => {
  showPreviewModal.value = false
  previewTemplate.value = null
}

const useTemplate = (template) => {
  // Navigate to leads page with template selected
  navigateTo(`/leads?template=${template.id}`)
}

const insertVariable = (variable) => {
  const textarea = document.querySelector('textarea')
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)
    textarea.value = before + `{{${variable}}}` + after
    textarea.focus()
    textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4)
  }
}

const filterTemplates = () => {
  // Templates are filtered by computed properties
}

onMounted(() => {
  loadTemplates()
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
