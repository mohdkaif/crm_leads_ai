<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              {{ isEditMode ? 'Edit Lead' : 'Add New Lead' }}
            </h1>
            <p class="text-gray-600">
              {{ isEditMode ? 'Update lead information' : 'Create a new lead in your CRM system' }}
            </p>
          </div>
          <NuxtLink to="/leads" class="btn-outline">
            <Icon name="heroicons:arrow-left" class="w-4 h-4 mr-2" />
            Back to Leads
          </NuxtLink>
        </div>
      </div>

      <div class="max-w-4xl mx-auto">
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Lead Information</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="createLead" class="space-y-6">
              <!-- Personal Information -->
              <div class="border-b border-gray-200 pb-6">
                <h4 class="text-md font-medium text-gray-900 mb-4">Personal Information</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="form-label">First Name *</label>
                    <input
                      v-model="lead.firstName"
                      type="text"
                      required
                      class="form-input"
                      :class="{ 'border-red-300': errors.firstName }"
                      placeholder="Enter first name"
                      @blur="validateField('firstName')"
                    />
                    <p v-if="errors.firstName" class="form-error">{{ errors.firstName }}</p>
                  </div>

                  <div>
                    <label class="form-label">Last Name *</label>
                    <input
                      v-model="lead.lastName"
                      type="text"
                      required
                      class="form-input"
                      :class="{ 'border-red-300': errors.lastName }"
                      placeholder="Enter last name"
                      @blur="validateField('lastName')"
                    />
                    <p v-if="errors.lastName" class="form-error">{{ errors.lastName }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label class="form-label">Email *</label>
                    <input
                      v-model="lead.email"
                      type="email"
                      required
                      :readonly="isEditMode"
                      class="form-input"
                      :class="{ 
                        'border-red-300': errors.email,
                        'bg-gray-100 cursor-not-allowed': isEditMode
                      }"
                      placeholder="Enter email address"
                      @blur="validateField('email')"
                    />
                    <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
                    <p v-if="isEditMode" class="text-xs text-gray-500 mt-1">
                      Email cannot be changed during editing
                    </p>
                  </div>

                  <div>
                    <label class="form-label">Phone</label>
                    <input
                      v-model="lead.phone"
                      type="tel"
                      :readonly="isEditMode"
                      class="form-input"
                      :class="{ 
                        'border-red-300': errors.phone,
                        'bg-gray-100 cursor-not-allowed': isEditMode
                      }"
                      placeholder="Enter phone number"
                      @blur="validateField('phone')"
                    />
                    <p v-if="errors.phone" class="form-error">{{ errors.phone }}</p>
                    <p v-if="isEditMode" class="text-xs text-gray-500 mt-1">
                      Phone cannot be changed during editing
                    </p>
                  </div>
                </div>
              </div>

              <!-- Company Information -->
              <div class="border-b border-gray-200 pb-6">
                <h4 class="text-md font-medium text-gray-900 mb-4">Company Information</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="form-label">Company *</label>
                    <input
                      v-model="lead.company"
                      type="text"
                      required
                      class="form-input"
                      :class="{ 'border-red-300': errors.company }"
                      placeholder="Enter company name"
                      @blur="validateField('company')"
                    />
                    <p v-if="errors.company" class="form-error">{{ errors.company }}</p>
                  </div>

                  <div>
                    <label class="form-label">Job Title</label>
                    <input
                      v-model="lead.jobTitle"
                      type="text"
                      class="form-input"
                      :class="{ 'border-red-300': errors.jobTitle }"
                      placeholder="Enter job title"
                    />
                    <p v-if="errors.jobTitle" class="form-error">{{ errors.jobTitle }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label class="form-label">Industry</label>
                    <select
                      v-model="lead.industry"
                      class="form-input"
                      :class="{ 'border-red-300': errors.industry }"
                    >
                      <option value="">Select industry</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="education">Education</option>
                      <option value="retail">Retail</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="consulting">Consulting</option>
                      <option value="other">Other</option>
                    </select>
                    <p v-if="errors.industry" class="form-error">{{ errors.industry }}</p>
                  </div>

                  <div>
                    <label class="form-label">Company Size</label>
                    <select
                      v-model="lead.companySize"
                      class="form-input"
                      :class="{ 'border-red-300': errors.companySize }"
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                    <p v-if="errors.companySize" class="form-error">{{ errors.companySize }}</p>
                  </div>
                </div>
              </div>

              <!-- Lead Management -->
              <div class="border-b border-gray-200 pb-6">
                <h4 class="text-md font-medium text-gray-900 mb-4">Lead Management</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label class="form-label">Status *</label>
                    <select
                      v-model="lead.status"
                      required
                      class="form-input"
                      :class="{ 'border-red-300': errors.status }"
                      @change="validateField('status')"
                    >
                      <option value="">Select status</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="proposal">Proposal</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="closed_won">Closed Won</option>
                      <option value="closed_lost">Closed Lost</option>
                    </select>
                    <p v-if="errors.status" class="form-error">{{ errors.status }}</p>
                  </div>

                  <div>
                    <label class="form-label">Priority</label>
                    <select
                      v-model="lead.priority"
                      class="form-input"
                      :class="{ 'border-red-300': errors.priority }"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <p v-if="errors.priority" class="form-error">{{ errors.priority }}</p>
                  </div>

                  <div>
                    <label class="form-label">Source</label>
                    <select
                      v-model="lead.source"
                      class="form-input"
                      :class="{ 'border-red-300': errors.source }"
                    >
                      <option value="">Select source</option>
                      <option value="website">Website</option>
                      <option value="social_media">Social Media</option>
                      <option value="email">Email Campaign</option>
                      <option value="referral">Referral</option>
                      <option value="cold_call">Cold Call</option>
                      <option value="event">Event</option>
                      <option value="other">Other</option>
                    </select>
                    <p v-if="errors.source" class="form-error">{{ errors.source }}</p>
                  </div>
                </div>
              </div>

              <!-- Financial Information -->
              <div class="border-b border-gray-200 pb-6">
                <h4 class="text-md font-medium text-gray-900 mb-4">Financial Information</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label class="form-label">Estimated Value</label>
                    <input
                      v-model="lead.value"
                      type="number"
                      min="0"
                      step="0.01"
                      class="form-input"
                      :class="{ 'border-red-300': errors.value }"
                      placeholder="0.00"
                      @blur="validateField('value')"
                    />
                    <p v-if="errors.value" class="form-error">{{ errors.value }}</p>
                  </div>

                  <div>
                    <label class="form-label">Currency</label>
                    <select
                      v-model="lead.currency"
                      class="form-input"
                      :class="{ 'border-red-300': errors.currency }"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="AUD">AUD (A$)</option>
                    </select>
                    <p v-if="errors.currency" class="form-error">{{ errors.currency }}</p>
                  </div>

                  <div>
                    <label class="form-label">Probability (%)</label>
                    <input
                      v-model="lead.probability"
                      type="number"
                      min="0"
                      max="100"
                      class="form-input"
                      :class="{ 'border-red-300': errors.probability }"
                      placeholder="50"
                      @blur="validateField('probability')"
                    />
                    <p v-if="errors.probability" class="form-error">{{ errors.probability }}</p>
                  </div>
                </div>
              </div>

              <!-- Additional Information -->
              <div>
                <h4 class="text-md font-medium text-gray-900 mb-4">Additional Information</h4>
                <div class="space-y-6">
                  <div>
                    <label class="form-label">Notes</label>
                    <textarea
                      v-model="lead.notes"
                      rows="4"
                      class="form-input"
                      :class="{ 'border-red-300': errors.notes }"
                      placeholder="Add any additional notes about this lead"
                    ></textarea>
                    <p v-if="errors.notes" class="form-error">{{ errors.notes }}</p>
                  </div>

                  <div>
                    <label class="form-label">Next Follow-up Date</label>
                    <input
                      v-model="lead.nextFollowUpDate"
                      type="datetime-local"
                      class="form-input"
                      :class="{ 'border-red-300': errors.nextFollowUpDate }"
                    />
                    <p v-if="errors.nextFollowUpDate" class="form-error">{{ errors.nextFollowUpDate }}</p>
                  </div>
                </div>
              </div>

              <!-- Error Messages -->
              <div v-if="errors.general" class="bg-red-50 border border-red-200 rounded-md p-4">
                <p class="text-sm text-red-600">{{ errors.general }}</p>
              </div>

              <!-- Success Message -->
              <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-md p-4">
                <p class="text-sm text-green-600">{{ successMessage }}</p>
              </div>

              <!-- Form Actions -->
              <div class="flex justify-end space-x-4">
                <NuxtLink to="/leads" class="btn-outline">
                  Cancel
                </NuxtLink>
                <button
                  type="submit"
                  :disabled="loading || !isFormValid"
                  class="btn-primary"
                  :class="{ 'opacity-50 cursor-not-allowed': loading || !isFormValid }"
                >
                  <Icon
                    v-if="loading"
                    name="heroicons:arrow-path"
                    class="w-4 h-4 mr-2 animate-spin"
                  />
                  {{ loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Lead' : 'Create Lead') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()
const route = useRoute()

// Reactive data
const loading = ref(false)
const isEditMode = ref(false)
const successMessage = ref('')
const lead = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  jobTitle: '',
  industry: '',
  companySize: '',
  status: '',
  source: '',
  priority: 'medium',
  value: '',
  currency: 'USD',
  probability: '',
  notes: '',
  nextFollowUpDate: ''
})
const errors = ref({})

// Computed properties
const isFormValid = computed(() => {
  return lead.value.firstName && 
         lead.value.lastName && 
         lead.value.email && 
         lead.value.company && 
         lead.value.status &&
         lead.value.source &&
         !Object.keys(errors.value).length
})

// Validation functions
const validateField = (fieldName) => {
  const value = lead.value[fieldName]
  delete errors.value[fieldName]

  switch (fieldName) {
    case 'firstName':
    case 'lastName':
      if (!value || value.trim().length < 2) {
        errors.value[fieldName] = `${fieldName === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`
      }
      break
    case 'email':
      if (!value) {
        errors.value[fieldName] = 'Email is required'
      } else if (!isValidEmail(value)) {
        errors.value[fieldName] = 'Please enter a valid email address'
      }
      break
    case 'phone':
      if (value && !isValidPhone(value)) {
        errors.value[fieldName] = 'Please enter a valid phone number'
      }
      break
    case 'company':
      if (!value || value.trim().length < 2) {
        errors.value[fieldName] = 'Company name must be at least 2 characters'
      }
      break
    case 'status':
      if (!value) {
        errors.value[fieldName] = 'Status is required'
      }
      break
    case 'source':
      if (!value) {
        errors.value[fieldName] = 'Source is required'
      }
      break
    case 'value':
      if (value && (isNaN(value) || parseFloat(value) < 0)) {
        errors.value[fieldName] = 'Value must be a positive number'
      }
      break
    case 'probability':
      if (value && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100)) {
        errors.value[fieldName] = 'Probability must be between 0 and 100'
      }
      break
    case 'nextFollowUpDate':
      if (value && new Date(value) <= new Date()) {
        errors.value[fieldName] = 'Follow-up date must be in the future'
      }
      break
  }
}

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

const validateForm = () => {
  errors.value = {}
  
  // Validate required fields
  validateField('firstName')
  validateField('lastName')
  validateField('email')
  validateField('company')
  validateField('status')
  validateField('source')
  
  // Validate optional fields if they have values
  if (lead.value.phone) validateField('phone')
  if (lead.value.value) validateField('value')
  if (lead.value.probability) validateField('probability')
  if (lead.value.nextFollowUpDate) validateField('nextFollowUpDate')
  
  return Object.keys(errors.value).length === 0
}

// Methods
const createLead = async () => {
  try {
    loading.value = true
    errors.value = {}
    successMessage.value = ''

    // Validate form
    if (!validateForm()) {
      return
    }

    // Prepare lead data
    const leadData = {
      ...lead.value,
      value: lead.value.value ? parseFloat(lead.value.value) : 0,
      probability: lead.value.probability ? parseInt(lead.value.probability) : 0,
      nextFollowUpDate: lead.value.nextFollowUpDate ? new Date(lead.value.nextFollowUpDate).toISOString() : null
    }

    // Get authentication token
    const token = useCookie('auth-token')
    console.log('Token value:', token.value) // Debug log
    
    if (!token.value) {
      // Try to get token from localStorage as fallback
      const localToken = process.client ? localStorage.getItem('auth-token') : null
      if (localToken) {
        token.value = localToken
      } else {
        errors.value.general = 'Authentication required. Please login again.'
        return
      }
    }

    // Make API call
    const url = isEditMode.value ? `/api/leads/${route.query.edit}` : '/api/leads'
    const method = isEditMode.value ? 'PUT' : 'POST'
    
    const response = await $fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      body: leadData
    })

    if (response.success) {
      successMessage.value = isEditMode.value ? 'Lead updated successfully!' : 'Lead created successfully!'
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/leads')
      }, 1500)
    }
  } catch (error) {
    console.error('Lead creation error:', error)
    errors.value.general = error.data?.message || 'An error occurred while creating the lead'
  } finally {
    loading.value = false
  }
}

const loadLeadForEdit = async (leadId) => {
  try {
    loading.value = true
    const token = useCookie('auth-token')
    
    // Fallback to localStorage if cookie is not available
    if (!token.value && process.client) {
      const localToken = localStorage.getItem('auth-token')
      if (localToken) {
        token.value = localToken
      }
    }
    
    const response = await $fetch(`/api/leads/${leadId}`, {
      headers: token.value ? { 'Authorization': `Bearer ${token.value}` } : {}
    })

    if (response.success) {
      const leadData = response.data
      lead.value = {
        firstName: leadData.firstName || '',
        lastName: leadData.lastName || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
        company: leadData.company || '',
        jobTitle: leadData.jobTitle || '',
        industry: leadData.industry || '',
        companySize: leadData.companySize || '',
        status: leadData.status || '',
        source: leadData.source || '',
        priority: leadData.priority || 'medium',
        value: leadData.value || '',
        currency: leadData.currency || 'USD',
        probability: leadData.probability || '',
        notes: leadData.notes || '',
        nextFollowUpDate: leadData.nextFollowUpDate ? new Date(leadData.nextFollowUpDate).toISOString().slice(0, 16) : ''
      }
    }
  } catch (error) {
    console.error('Error loading lead:', error)
    errors.value.general = 'Error loading lead data'
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  const editId = route.query.edit
  if (editId) {
    isEditMode.value = true
    loadLeadForEdit(editId)
  }
})

// Meta
definePageMeta({
  layout: 'default',
  auth: true
})
</script>
