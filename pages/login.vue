<template>
  <NuxtLayout name="auth">
    <form @submit.prevent="handleLogin" class="space-y-6">
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

          <!-- Password Field -->
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
                autocomplete="current-password"
                required
                class="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': errors.password }"
                placeholder="Enter your password"
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

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="form.remember"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div class="text-sm">
              <NuxtLink
                to="/forgot-password"
                class="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Forgot password?
              </NuxtLink>
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
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Icon
                v-if="loading"
                name="heroicons:arrow-path"
                class="h-5 w-5 mr-2 animate-spin"
              />
              <Icon
                v-else
                name="heroicons:arrow-right-on-rectangle"
                class="h-5 w-5 mr-2"
              />
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>

          <!-- Divider -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <!-- Social Login Buttons -->
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
            >
              <Icon name="heroicons:envelope" class="h-5 w-5" />
              <span class="ml-2">Google</span>
            </button>
            <button
              type="button"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
            >
              <Icon name="heroicons:envelope" class="h-5 w-5" />
              <span class="ml-2">Microsoft</span>
            </button>
          </div>
        </form>

        <!-- Sign Up Link -->
        <div class="text-center mt-6">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <NuxtLink
              to="/register"
              class="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Sign up for free
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
  email: '',
  password: '',
  remember: false
})
const errors = ref({})

// Methods
const handleLogin = async () => {
  try {
    loading.value = true
    errors.value = {}

    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: form.value
    })

    if (response.success) {
      // Store authentication token in both cookie and localStorage
      const token = useCookie('auth-token', {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        secure: false, // Changed to false for local development
        sameSite: 'lax' // Changed to lax for better compatibility
      })
      token.value = response.token

      // Also store in localStorage as backup
      if (process.client) {
        localStorage.setItem('auth-token', response.token)
      }

      // Store user data
      const user = useUser()
      user.value = response.user

      // Redirect to dashboard
      await router.push('/')
    }
  } catch (error) {
    console.error('Login error:', error)
    
    if (error.data?.message) {
      errors.value.general = error.data.message
    } else {
      errors.value.general = 'An error occurred during login'
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
