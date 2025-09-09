<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside 
      :class="[
        'sidebar transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'sidebar-open' : 'sidebar-closed'
      ]"
    >
      <div class="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
        <h1 class="text-xl font-bold text-gradient">CRM Leads AI</h1>
        <button
          @click="toggleSidebar"
          class="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <Icon name="heroicons:x-mark" class="w-6 h-6" />
        </button>
      </div>
      
      <nav class="mt-6 px-3">
        <div class="space-y-6">
          <!-- Main Dashboard -->
          <div>
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Main</h3>
            <div class="space-y-1">
              <NuxtLink
                v-for="item in navigation.filter(nav => nav.category === 'main')"
                :key="item.name"
                :to="item.href"
                :class="[
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  $route.path === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                ]"
              >
                <Icon :name="item.icon" class="w-5 h-5 mr-3" />
                {{ item.name }}
              </NuxtLink>
            </div>
          </div>

          <!-- Lead Management -->
          <div>
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lead Management</h3>
            <div class="space-y-1">
              <NuxtLink
                v-for="item in navigation.filter(nav => nav.category === 'leads')"
                :key="item.name"
                :to="item.href"
                :class="[
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  $route.path === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                ]"
              >
                <Icon :name="item.icon" class="w-5 h-5 mr-3" />
                {{ item.name }}
              </NuxtLink>
            </div>
          </div>

          <!-- Analytics & Insights -->
          <div>
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Analytics & Insights</h3>
            <div class="space-y-1">
              <NuxtLink
                v-for="item in navigation.filter(nav => nav.category === 'analytics')"
                :key="item.name"
                :to="item.href"
                :class="[
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  $route.path === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                ]"
              >
                <Icon :name="item.icon" class="w-5 h-5 mr-3" />
                {{ item.name }}
              </NuxtLink>
            </div>
          </div>

          <!-- Management -->
          <div>
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Management</h3>
            <div class="space-y-1">
              <NuxtLink
                v-for="item in navigation.filter(nav => nav.category === 'management')"
                :key="item.name"
                :to="item.href"
                :class="[
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  $route.path === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                ]"
              >
                <Icon :name="item.icon" class="w-5 h-5 mr-3" />
                {{ item.name }}
              </NuxtLink>
            </div>
          </div>

          <!-- Settings -->
          <div>
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Settings</h3>
            <div class="space-y-1">
              <NuxtLink
                v-for="item in navigation.filter(nav => nav.category === 'settings')"
                :key="item.name"
                :to="item.href"
                :class="[
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  $route.path === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                ]"
              >
                <Icon :name="item.icon" class="w-5 h-5 mr-3" />
                {{ item.name }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Main content -->
    <div class="main-content flex-1 flex flex-col overflow-hidden">
      <!-- Top navigation -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between h-16 px-6">
          <div class="flex items-center">
            <button
              @click="toggleSidebar"
              class="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Icon name="heroicons:bars-3" class="w-6 h-6" />
            </button>
            <div class="ml-4">
              <h2 class="text-lg font-semibold text-gray-900">
                {{ pageTitle }}
              </h2>
              <p class="text-sm text-gray-500">{{ pageDescription }}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Quick Actions -->
            <div class="hidden md:flex items-center space-x-2">
              <NuxtLink
                to="/leads/new"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Icon name="heroicons:plus" class="w-4 h-4 mr-1" />
                New Lead
              </NuxtLink>
            </div>

            <!-- Search -->
            <div class="hidden md:block">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="heroicons:magnifying-glass" class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  class="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <!-- Notifications -->
            <button class="p-2 text-gray-400 hover:text-gray-600 relative">
              <Icon name="heroicons:bell" class="w-6 h-6" />
              <span v-if="notificationCount > 0" class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {{ notificationCount }}
              </span>
            </button>
            
            <!-- User menu -->
            <div class="relative">
              <button
                @click="toggleUserMenu"
                class="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50"
              >
                <img
                  v-if="user?.avatar"
                  :src="user.avatar"
                  :alt="user.firstName"
                  class="w-8 h-8 rounded-full"
                />
                <div v-else class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}
                </div>
                <div class="hidden md:block text-left">
                  <p class="text-sm font-medium text-gray-900">{{ user?.firstName }} {{ user?.lastName }}</p>
                  <p class="text-xs text-gray-500">{{ user?.role }}</p>
                </div>
                <Icon name="heroicons:chevron-down" class="w-4 h-4 text-gray-400" />
              </button>
              
              <!-- User dropdown -->
              <div
                v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
              >
                <!-- User Info -->
                <div class="px-4 py-3 border-b border-gray-100">
                  <p class="text-sm font-medium text-gray-900">{{ user?.firstName }} {{ user?.lastName }}</p>
                  <p class="text-xs text-gray-500">{{ user?.email }}</p>
                  <p class="text-xs text-blue-600 font-medium">{{ user?.role }}</p>
                </div>
                
                <!-- Menu Items -->
                <div class="py-1">
                  <NuxtLink
                    to="/profile"
                    class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="userMenuOpen = false"
                  >
                    <Icon name="heroicons:user" class="w-4 h-4 mr-3" />
                    Profile
                  </NuxtLink>
                  <NuxtLink
                    to="/settings"
                    class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="userMenuOpen = false"
                  >
                    <Icon name="heroicons:cog-6-tooth" class="w-4 h-4 mr-3" />
                    Settings
                  </NuxtLink>
                  <button
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="userMenuOpen = false"
                  >
                    <Icon name="heroicons:bell" class="w-4 h-4 mr-3" />
                    Notifications
                  </button>
                  <button
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    @click="userMenuOpen = false"
                  >
                    <Icon name="heroicons:question-mark-circle" class="w-4 h-4 mr-3" />
                    Help & Support
                  </button>
                </div>
                
                <hr class="my-1" />
                
                <!-- Logout -->
                <button
                  @click="logout"
                  class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4 mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="content-area flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>

    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      @click="toggleSidebar"
      class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
    />
  </div>
</template>

<script setup>
const { $auth } = useNuxtApp()
const router = useRouter()

// Reactive state
const sidebarOpen = ref(true) // Open by default on desktop
const userMenuOpen = ref(false)
const notificationCount = ref(3) // Mock notification count

// User data
const user = ref(null)

// Navigation items organized by category
const navigation = [
  // Main Dashboard
  { name: 'Dashboard', href: '/', icon: 'heroicons:home', category: 'main' },
  
  // Lead Management
  { name: 'Leads', href: '/leads', icon: 'heroicons:users', category: 'leads' },
  { name: 'New Lead', href: '/leads/new', icon: 'heroicons:plus-circle', category: 'leads' },
  
  // Analytics & Insights
  { name: 'Analytics', href: '/analytics', icon: 'heroicons:chart-bar', category: 'analytics' },
  { name: 'AI Insights', href: '/ai-insights', icon: 'heroicons:sparkles', category: 'analytics' },
  
  // Management
  { name: 'Activities', href: '/activities', icon: 'heroicons:clock', category: 'management' },
  { name: 'Users', href: '/users', icon: 'heroicons:user-group', category: 'management' },
  
  // Settings
  { name: 'Settings', href: '/settings', icon: 'heroicons:cog-6-tooth', category: 'settings' },
  { name: 'Profile', href: '/profile', icon: 'heroicons:user', category: 'settings' }
]

// Computed
const pageTitle = computed(() => {
  const route = useRoute()
  const item = navigation.find(nav => nav.href === route.path)
  return item?.name || 'Dashboard'
})

const pageDescription = computed(() => {
  const route = useRoute()
  const descriptions = {
    '/': 'Overview of your CRM performance and key metrics',
    '/leads': 'Manage and track all your leads',
    '/leads/new': 'Create a new lead in your CRM system',
    '/analytics': 'View detailed analytics and performance metrics',
    '/ai-insights': 'AI-powered insights and recommendations',
    '/activities': 'Track and manage all activities',
    '/users': 'Manage team members and user permissions',
    '/settings': 'Configure system settings and preferences',
    '/profile': 'Manage your account information and preferences'
  }
  return descriptions[route.path] || 'Manage your CRM data and settings'
})

// Methods
const toggleSidebar = () => {
  sidebarOpen.value = true
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const logout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Responsive sidebar behavior
const handleResize = () => {
  if (process.client) {
    if (window.innerWidth >= 1024) {
      sidebarOpen.value = true // Open on desktop
    } else {
      sidebarOpen.value = false // Close on mobile
    }
  }
}

// Lifecycle
onMounted(async () => {
  try {
    const response = await $fetch('/api/auth/me')
    user.value = response.user
  } catch (error) {
    console.error('Auth error:', error)
    await router.push('/login')
  }
  
  // Set initial sidebar state based on screen size
  handleResize()
  
  // Add resize listener
  if (process.client) {
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', handleResize)
  }
})

// Close dropdowns when clicking outside
onClickOutside(userMenuOpen, () => {
  userMenuOpen.value = false
})
</script>

<style scoped>
  .sidebar {
    @apply w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-40;
  }

  .sidebar-closed {
    @apply -translate-x-full;
  }

  .sidebar-open {
    @apply translate-x-0;
  }

  .main-content {
    @apply flex-1 flex flex-col min-h-screen ml-0 lg:ml-64 relative z-10;
  }

  .content-area {
    @apply flex-1 overflow-y-auto bg-gray-50 p-6;
  }

.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Custom scrollbar for sidebar */
.sidebar nav {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.sidebar nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar nav::-webkit-scrollbar-track {
  background: #f7fafc;
}

.sidebar nav::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 2px;
}

.sidebar nav::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}

/* Ensure content is visible */
.content-area > * {
  @apply relative z-10;
}

/* Fix for mobile overlay */
@media (max-width: 1024px) {
  .main-content {
    @apply ml-0;
  }
  
  .sidebar-closed {
    @apply -translate-x-full;
  }
  
  .sidebar-open {
    @apply translate-x-0;
  }
}
</style>
