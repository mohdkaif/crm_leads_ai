<template>
  <NuxtLayout name="auth">
    <form @submit.prevent="handleForgotPassword" class="space-y-6">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="heroicons:envelope" class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.email }"
                placeholder="Enter your email address"
              />
            </div>
            <p v-if="errors.email" class="mt-2 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex">
              <Icon name="heroicons:check-circle" class="h-5 w-5 text-green-400 mr-3 mt-0.5" />
              <div>
                <h3 class="text-sm font-medium text-green-800">Email sent successfully!</h3>
                <p class="text-sm text-green-700 mt-1">
                  If an account with that email exists, we've sent you a password reset link. Please check your inbox and spam folder.
                </p>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errors.general" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-red-400 mr-2" />
              <p class="text-sm text-red-600">{{ errors.general }}</p>
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="loading || success"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Icon
                v-if="loading"
                name="heroicons:arrow-path"
                class="h-5 w-5 mr-2 animate-spin"
              />
              <Icon
                v-else-if="success"
                name="heroicons:check"
                class="h-5 w-5 mr-2"
              />
              <Icon
                v-else
                name="heroicons:paper-airplane"
                class="h-5 w-5 mr-2"
              />
              {{ loading ? 'Sending...' : success ? 'Email Sent!' : 'Send Reset Link' }}
            </button>
          </div>

          <!-- Help Text -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex">
              <Icon name="heroicons:information-circle" class="h-5 w-5 text-blue-400 mr-2" />
              <div class="text-sm text-blue-700">
                <p class="font-medium">Didn't receive the email?</p>
                <p class="mt-1">Check your spam folder or try again in a few minutes.</p>
              </div>
            </div>
          </div>
        </form>

        <!-- Back to Login -->
        <div class="text-center mt-6">
          <p class="text-sm text-gray-600">
            Remember your password?
            <NuxtLink
              to="/login"
              class="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200"
            >
              Sign in
            </NuxtLink>
          </p>
        </div>

        <!-- Additional Help -->
        <div class="text-center mt-4">
          <p class="text-xs text-gray-500">
            Need help? Contact our 
            <a href="mailto:support@crmleadsai.com" class="text-orange-600 hover:text-orange-500 transition-colors duration-200">
              support team
            </a>
          </p>
        </div>
  </NuxtLayout>
</template>

<script setup>
// Reactive data
const loading = ref(false)
const success = ref(false)
const form = ref({
  email: ''
})
const errors = ref({})

// Methods
const handleForgotPassword = async () => {
  try {
    loading.value = true
    errors.value = {}
    success.value = false

    // For now, just simulate success since we don't have email service set up
    // In a real app, you would call an API endpoint here
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    success.value = true
  } catch (error) {
    console.error('Forgot password error:', error)
    errors.value.general = 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

// Meta
definePageMeta({
  layout: 'auth',
  auth: false
})
</script>
