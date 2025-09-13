<template>
  <Teleport to="body">
    <div v-if="show" class="email-composer-modal">
      <div class="modal-overlay" @click="close"></div>
      <div class="modal-container max-w-4xl" @click.stop>
      <div class="modal-content">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900">Send Email</h3>
          <button @click="close" class="text-gray-400 hover:text-gray-600">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>
        
        <div class="card-body">
          <form @submit.prevent="sendEmail">
            <!-- Lead Selection -->
            <div class="mb-6">
              <label class="form-label">Select Lead *</label>
              <select v-model="emailForm.leadId" class="form-input" required>
                <option value="">Choose a lead...</option>
                <option v-for="lead in leads" :key="lead._id" :value="lead._id">
                  {{ lead.firstName }} {{ lead.lastName }} - {{ lead.company }} ({{ lead.email }})
                </option>
              </select>
            </div>

            <!-- Template Selection -->
            <div class="mb-6">
              <label class="form-label">Email Template</label>
              <div class="flex space-x-4">
                <select v-model="emailForm.templateId" @change="loadTemplate" class="form-input flex-1">
                  <option value="">Choose a template...</option>
                  <optgroup label="System Templates">
                    <option v-for="template in systemTemplates" :key="template.id" :value="template.id">
                      {{ template.name }}
                    </option>
                  </optgroup>
                  <optgroup label="Custom Templates">
                    <option v-for="template in customTemplates" :key="template.id" :value="template.id">
                      {{ template.name }}
                    </option>
                  </optgroup>
                </select>
                <button type="button" @click="loadTemplates" class="btn btn-outline">
                  <Icon name="heroicons:arrow-path" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Email Subject -->
            <div class="mb-6">
              <label class="form-label">Subject *</label>
              <input v-model="emailForm.subject" type="text" class="form-input" required />
            </div>

            <!-- Email Content -->
            <div class="mb-6">
              <label class="form-label">Email Content *</label>
              <div class="border rounded-lg">
                <div class="bg-gray-50 px-4 py-2 border-b">
                  <div class="flex items-center justify-between">
                    <div class="flex space-x-2">
                      <button type="button" @click="toggleEditor" class="btn btn-sm btn-outline">
                        {{ useRichEditor ? 'HTML' : 'Rich' }} Editor
                      </button>
                      <div class="flex space-x-1">
                        <button type="button" @click="insertVariable('leadName')" class="btn btn-sm btn-outline">
                          Lead Name
                        </button>
                        <button type="button" @click="insertVariable('company')" class="btn btn-sm btn-outline">
                          Company
                        </button>
                        <button type="button" @click="insertVariable('senderName')" class="btn btn-sm btn-outline">
                          Sender Name
                        </button>
                      </div>
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ emailForm.html.length }} characters
                    </div>
                  </div>
                </div>
                
                <div v-if="useRichEditor" class="p-4">
                  <div 
                    ref="richEditor"
                    class="min-h-64 border rounded p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    contenteditable="true"
                    @input="updateContent"
                    v-html="emailForm.html"
                  ></div>
                </div>
                
                <div v-else class="p-4">
                  <textarea 
                    v-model="emailForm.html" 
                    rows="12" 
                    class="form-input w-full min-h-64"
                    placeholder="Enter your email content here..."
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Preview -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-2">
                <label class="form-label">Preview</label>
                <button type="button" @click="showPreview = !showPreview" class="btn btn-sm btn-outline">
                  {{ showPreview ? 'Hide' : 'Show' }} Preview
                </button>
              </div>
              <div v-if="showPreview" class="border rounded-lg p-4 bg-white max-h-64 overflow-y-auto">
                <div v-html="emailForm.html"></div>
              </div>
            </div>

            <!-- Send Options -->
            <div class="mb-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Send to email address</label>
                  <input 
                    v-model="emailForm.sendToEmail" 
                    type="email" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address or leave empty to use lead's email"
                  />
                </div>
                <label class="flex items-center">
                  <input v-model="emailForm.saveAsActivity" type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked />
                  <span class="ml-2 text-sm text-gray-700">Save as activity</span>
                </label>
              </div>
            </div>
          </form>
        </div>
        
        <div class="card-footer">
          <div class="flex justify-between">
            <div class="flex space-x-2">
              <button @click="saveDraft" class="btn btn-outline" :disabled="saving">
                <Icon name="heroicons:document" class="w-4 h-4 mr-2" />
                Save Draft
              </button>
              <button @click="testEmail" class="btn btn-outline" :disabled="saving">
                <Icon name="heroicons:envelope" class="w-4 h-4 mr-2" />
                Test Email
              </button>
            </div>
            <div class="flex space-x-2">
              <button @click="close" class="btn btn-outline" :disabled="saving">Cancel</button>
              <button @click="sendEmail" class="btn btn-primary" :disabled="saving || !emailForm.leadId || !emailForm.subject || !emailForm.html">
                <Icon name="heroicons:paper-airplane" class="w-4 h-4 mr-2" />
                {{ saving ? 'Sending...' : 'Send Email' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useCookie } from '#app'

// Use auth composable
const { fetchUser } = useAuth()

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  leadId: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['close', 'sent'])

// Reactive data
const leads = ref([])
const systemTemplates = ref([])
const customTemplates = ref([])
const loading = ref(false)
const saving = ref(false)
const showPreview = ref(false)
const useRichEditor = ref(false)

const emailForm = ref({
  leadId: '',
  templateId: '',
  subject: '',
  html: '',
  sendToEmail: '',
  saveAsActivity: true
})

const richEditor = ref(null)

// Methods
const loadLeads = async () => {
  try {
    const { fetchUser } = useAuth()
    const currentUser = await fetchUser()
    
    if (!currentUser) {
      throw new Error('Authentication required')
    }

    const response = await $fetch('/api/leads')

    if (response.success) {
      leads.value = response.data || []
      console.log('Loaded leads:', leads.value.length, leads.value)
    } else {
      console.error('Failed to load leads:', response)
      throw new Error('Failed to load leads')
    }
  } catch (err) {
    console.error('Error loading leads:', err)
    const { error: showError } = useAlert()
    await showError('Failed to load leads', 'Please try again.')
  }
}

const loadTemplates = async () => {
  try {
    const { fetchUser } = useAuth()
    const currentUser = await fetchUser()
    
    if (!currentUser) {
      throw new Error('Authentication required')
    }

    const response = await $fetch('/api/email/templates')

    if (response.success) {
      systemTemplates.value = response.data.systemTemplates || []
      customTemplates.value = response.data.customTemplates || []
      console.log('Loaded templates:', {
        system: systemTemplates.value.length,
        custom: customTemplates.value.length
      })
    } else {
      console.error('Failed to load templates:', response)
      throw new Error('Failed to load templates')
    }
  } catch (err) {
    console.error('Error loading templates:', err)
    const { error: showError } = useAlert()
    await showError('Failed to load templates', 'Please try again.')
  }
}

const loadTemplate = () => {
  if (!emailForm.value.templateId) return
  
  const allTemplates = [...systemTemplates.value, ...customTemplates.value]
  const template = allTemplates.find(t => t.id === emailForm.value.templateId)
  
  if (template) {
    emailForm.value.subject = template.subject
    emailForm.value.html = template.html
  }
}

const sendEmail = async () => {
  // Validation
  const { warning: showWarning } = useAlert()
  if (!emailForm.value.leadId) {
    await showWarning('Validation Error', 'Please select a lead')
    return
  }
  
  if (!emailForm.value.subject.trim()) {
    await showWarning('Validation Error', 'Please enter a subject')
    return
  }
  
  if (!emailForm.value.html.trim()) {
    await showWarning('Validation Error', 'Please enter email content')
    return
  }

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

    const response = await $fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: {
        leadId: emailForm.value.leadId,
        templateId: emailForm.value.templateId || null,
        customSubject: emailForm.value.subject,
        customMessage: emailForm.value.html,
        sendToEmail: emailForm.value.sendToEmail
      }
    })

    if (response.success) {
      emit('sent', response.data)
      close()
    } else {
      throw new Error('Failed to send email')
    }
  } catch (err) {
    console.error('Error sending email:', err)
    const { error: showError } = useAlert()
    await showError('Failed to send email', err.data?.message || err.message || 'Please try again')
  } finally {
    saving.value = false
  }
}

const saveDraft = async () => {
  // Validation
  const { warning: showWarning } = useAlert()
  if (!emailForm.value.leadId) {
    await showWarning('Validation Error', 'Please select a lead')
    return
  }
  
  if (!emailForm.value.subject.trim()) {
    await showWarning('Validation Error', 'Please enter a subject')
    return
  }
  
  if (!emailForm.value.html.trim()) {
    await showWarning('Validation Error', 'Please enter email content')
    return
  }

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

    const response = await $fetch('/api/email/draft', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: {
        leadId: emailForm.value.leadId,
        subject: emailForm.value.subject,
        html: emailForm.value.html,
        templateId: emailForm.value.templateId || null,
        isDraft: true
      }
    })

    if (response.success) {
      const { success } = useAlert()
      await success('Draft saved successfully!')
      emit('sent', response.data)
    } else {
      throw new Error('Failed to save draft')
    }
  } catch (err) {
    console.error('Error saving draft:', err)
    const { error: showError } = useAlert()
    await showError('Failed to save draft', err.data?.message || err.message || 'Please try again')
  } finally {
    saving.value = false
  }
}

const testEmail = async () => {
  // Test email functionality
  console.log('Sending test email...')
  const { info } = useAlert()
  await info('Test Email', 'Test email sent! (This is a placeholder - implement test email)')
}

const insertVariable = (variable) => {
  const content = `{{${variable}}}`
  
  if (useRichEditor.value && richEditor.value) {
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(content))
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  } else {
    // For textarea
    const textarea = document.querySelector('textarea')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = textarea.value
      const before = text.substring(0, start)
      const after = text.substring(end, text.length)
      textarea.value = before + content + after
      textarea.focus()
      textarea.setSelectionRange(start + content.length, start + content.length)
    }
  }
}

const updateContent = () => {
  if (richEditor.value) {
    emailForm.value.html = richEditor.value.innerHTML
  }
}

const toggleEditor = () => {
  useRichEditor.value = !useRichEditor.value
}

const close = () => {
  emit('close')
  // Reset form
  emailForm.value = {
    leadId: '',
    templateId: '',
    subject: '',
    html: '',
    sendToEmail: '',
    saveAsActivity: true
  }
  showPreview.value = false
}

// Watch for leadId prop changes
watch(() => props.leadId, (newLeadId) => {
  if (newLeadId) {
    emailForm.value.leadId = newLeadId
  }
})

// Watch for show prop changes
watch(() => props.show, (newShow) => {
  if (newShow) {
    loadLeads()
    loadTemplates()
    if (props.leadId) {
      emailForm.value.leadId = props.leadId
    }
  }
})

onMounted(() => {
  if (props.show) {
    loadLeads()
    loadTemplates()
  }
})
</script>

<style scoped>
.email-composer-modal {
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


