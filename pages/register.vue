<template>
  <NuxtLayout name="auth">
    <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Name Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="heroicons:user" class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  required
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.firstName }"
                  placeholder="Enter your first name"
                />
              </div>
              <p v-if="errors.firstName" class="mt-2 text-sm text-red-600">{{ errors.firstName }}</p>
            </div>

            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="heroicons:user" class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  required
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.lastName }"
                  placeholder="Enter your last name"
                />
              </div>
              <p v-if="errors.lastName" class="mt-2 text-sm text-red-600">{{ errors.lastName }}</p>
            </div>
          </div>

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
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.email }"
                placeholder="Enter your email"
              />
            </div>
            <p v-if="errors.email" class="mt-2 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <!-- Password Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="heroicons:lock-closed" class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  class="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.password }"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors duration-200"
                >
                  <Icon
                    :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
                    class="h-5 w-5 text-gray-400"
                  />
                </button>
              </div>
              <p v-if="errors.password" class="mt-2 text-sm text-red-600">{{ errors.password }}</p>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="heroicons:lock-closed" class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  type="password"
                  autocomplete="new-password"
                  required
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.confirmPassword }"
                  placeholder="Confirm your password"
                />
              </div>
              <p v-if="errors.confirmPassword" class="mt-2 text-sm text-red-600">{{ errors.confirmPassword }}</p>
            </div>
          </div>

          <!-- Phone and Department -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span class="text-gray-400">(Optional)</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="heroicons:phone" class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.phone }"
                  placeholder="Enter your phone number"
                />
              </div>
              <p v-if="errors.phone" class="mt-2 text-sm text-red-600">{{ errors.phone }}</p>
            </div>

            <div>
              <label for="department" class="block text-sm font-medium text-gray-700 mb-2">
                Department <span class="text-gray-400">(Optional)</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="heroicons:building-office" class="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="department"
                  v-model="form.department"
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 appearance-none bg-white"
                  :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.department }"
                >
                  <option value="">Select department</option>
                  <option value="sales">Sales</option>
                  <option value="marketing">Marketing</option>
                  <option value="support">Support</option>
                  <option value="management">Management</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Icon name="heroicons:chevron-down" class="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <p v-if="errors.department" class="mt-2 text-sm text-red-600">{{ errors.department }}</p>
            </div>
          </div>

          <!-- Terms and Conditions -->
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="terms"
                v-model="form.acceptTerms"
                type="checkbox"
                required
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="terms" class="text-gray-700">
                I agree to the 
                <a href="/terms" class="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200">Terms of Service</a> 
                and 
                <a href="/privacy" class="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200">Privacy Policy</a>
              </label>
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
              :disabled="loading"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Icon
                v-if="loading"
                name="heroicons:arrow-path"
                class="h-5 w-5 mr-2 animate-spin"
              />
              <Icon
                v-else
                name="heroicons:user-plus"
                class="h-5 w-5 mr-2"
              />
              {{ loading ? 'Creating account...' : 'Create Account' }}
            </button>
          </div>
        </form>

        <!-- Sign In Link -->
        <div class="text-center mt-6">
          <p class="text-sm text-gray-600">
            Already have an account?
            <NuxtLink
              to="/login"
              class="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Sign in
            </NuxtLink>
          </p>
        </div>
  </NuxtLayout>
</template>

<script setup>
const router = useRouter()

// Reactive data
const loading = ref(false)
const showPassword = ref(false)
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  department: '',
  acceptTerms: false
})
const errors = ref({})

// Methods
const handleRegister = async () => {
  try {
    loading.value = true
    errors.value = {}

    // Basic validation
    if (form.value.password !== form.value.confirmPassword) {
      errors.value.confirmPassword = 'Passwords do not match'
      return
    }

    if (form.value.password.length < 6) {
      errors.value.password = 'Password must be at least 6 characters'
      return
    }

    if (!form.value.acceptTerms) {
      errors.value.general = 'Please accept the terms and conditions'
      return
    }

    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.email,
        password: form.value.password,
        phone: form.value.phone,
        department: form.value.department
      }
    })

    if (response.success) {
      // Store user data
      const user = useUser()
      user.value = response.user

      // Redirect to dashboard
      await router.push('/')
    }
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error.data?.message) {
      errors.value.general = error.data.message
    } else if (error.data?.errors) {
      errors.value = { ...errors.value, ...error.data.errors }
    } else {
      errors.value.general = 'An error occurred during registration'
    }
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
