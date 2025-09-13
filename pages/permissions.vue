<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Role & Permissions</h1>
            <p class="text-gray-600">Manage user roles and their permissions across the system</p>
          </div>
        </div>
      </div>

      <!-- Role Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-red-100 text-red-600">
                <Icon name="heroicons:shield-check" class="w-6 h-6" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Admin</p>
                <p class="text-2xl font-bold text-gray-900">{{ roleStats.admin }}</p>
                <p class="text-xs text-gray-500">Full system access</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-purple-100 text-purple-600">
                <Icon name="heroicons:user-group" class="w-6 h-6" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Sales Manager</p>
                <p class="text-2xl font-bold text-gray-900">{{ roleStats.sales_manager }}</p>
                <p class="text-xs text-gray-500">Sales team management</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-blue-100 text-blue-600">
                <Icon name="heroicons:briefcase" class="w-6 h-6" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Account Manager</p>
                <p class="text-2xl font-bold text-gray-900">{{ roleStats.account_manager }}</p>
                <p class="text-xs text-gray-500">Account management</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-green-100 text-green-600">
                <Icon name="heroicons:chart-bar" class="w-6 h-6" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Sales Rep</p>
                <p class="text-2xl font-bold text-gray-900">{{ roleStats.sales_rep }}</p>
                <p class="text-xs text-gray-500">Lead management</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Icon name="heroicons:heart" class="w-6 h-6" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Customer Success</p>
                <p class="text-2xl font-bold text-gray-900">{{ roleStats.customer_success }}</p>
                <p class="text-xs text-gray-500">Customer retention</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-pink-100 text-pink-600">
                <Icon name="heroicons:megaphone" class="w-6 h-6" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Marketing</p>
                <p class="text-2xl font-bold text-gray-900">{{ roleStats.marketing }}</p>
                <p class="text-xs text-gray-500">Marketing campaigns</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-orange-100 text-orange-600">
                <Icon name="heroicons:lifebuoy" class="w-6 h-6" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Support</p>
                <p class="text-2xl font-bold text-gray-900">{{ roleStats.support }}</p>
                <p class="text-xs text-gray-500">Customer support</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-gray-100 text-gray-600">
                <Icon name="heroicons:eye" class="w-6 h-6" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Viewer</p>
                <p class="text-2xl font-bold text-gray-900">{{ roleStats.viewer }}</p>
                <p class="text-xs text-gray-500">Read-only access</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Role Permissions Table -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900">Role Permissions Matrix</h3>
          <p class="text-sm text-gray-600">Overview of what each role can access and do</p>
        </div>
        <div class="card-body">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Manager</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Account Manager</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Rep</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Success</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Marketing</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Support</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Viewer</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="resource in permissionMatrix" :key="resource.name">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <Icon :name="resource.icon" class="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ resource.name }}</div>
                        <div class="text-sm text-gray-500">{{ resource.description }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex justify-center">
                      <span v-for="action in resource.actions" :key="action" 
                            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1">
                        {{ action }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex justify-center">
                      <span v-for="action in getRoleActions(resource.name, 'sales_manager')" :key="action" 
                            :class="getActionBadgeClass(action, 'sales_manager')"
                            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-1">
                        {{ action }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex justify-center">
                      <span v-for="action in getRoleActions(resource.name, 'account_manager')" :key="action" 
                            :class="getActionBadgeClass(action, 'account_manager')"
                            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-1">
                        {{ action }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex justify-center">
                      <span v-for="action in getRoleActions(resource.name, 'sales_rep')" :key="action" 
                            :class="getActionBadgeClass(action, 'sales_rep')"
                            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-1">
                        {{ action }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex justify-center">
                      <span v-for="action in getRoleActions(resource.name, 'customer_success')" :key="action" 
                            :class="getActionBadgeClass(action, 'customer_success')"
                            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-1">
                        {{ action }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex justify-center">
                      <span v-for="action in getRoleActions(resource.name, 'marketing')" :key="action" 
                            :class="getActionBadgeClass(action, 'marketing')"
                            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-1">
                        {{ action }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex justify-center">
                      <span v-for="action in getRoleActions(resource.name, 'support')" :key="action" 
                            :class="getActionBadgeClass(action, 'support')"
                            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-1">
                        {{ action }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <div class="flex justify-center">
                      <span v-for="action in getRoleActions(resource.name, 'viewer')" :key="action" 
                            :class="getActionBadgeClass(action, 'viewer')"
                            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-1">
                        {{ action }}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Role Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <!-- Admin Role Details -->
        <div class="card">
          <div class="card-header">
            <div class="flex items-center">
              <div class="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                <Icon name="heroicons:shield-check" class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Admin Role</h3>
                <p class="text-sm text-gray-600">Full system access and control</p>
              </div>
            </div>
          </div>
          <div class="card-body">
            <ul class="space-y-2">
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                Complete user management
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                Full lead management
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                System settings control
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                Analytics and reporting
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                Assignment rules management
              </li>
            </ul>
          </div>
        </div>

        <!-- Manager Role Details -->
        <div class="card">
          <div class="card-header">
            <div class="flex items-center">
              <div class="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                <Icon name="heroicons:user-group" class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Manager Role</h3>
                <p class="text-sm text-gray-600">Team and lead management</p>
              </div>
            </div>
          </div>
          <div class="card-body">
            <ul class="space-y-2">
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                Manage sales and viewer users
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                Full lead management
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                Team analytics
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                Assignment rules
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:x-mark" class="w-4 h-4 text-red-500 mr-2" />
                Cannot create admin users
              </li>
            </ul>
          </div>
        </div>

        <!-- Sales Role Details -->
        <div class="card">
          <div class="card-header">
            <div class="flex items-center">
              <div class="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                <Icon name="heroicons:chart-bar" class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Sales Role</h3>
                <p class="text-sm text-gray-600">Lead and activity management</p>
              </div>
            </div>
          </div>
          <div class="card-body">
            <ul class="space-y-2">
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                Manage own leads
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                Create and manage activities
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                Own analytics and reports
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                Email management
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:x-mark" class="w-4 h-4 text-red-500 mr-2" />
                Cannot manage other users
              </li>
            </ul>
          </div>
        </div>

        <!-- Viewer Role Details -->
        <div class="card">
          <div class="card-header">
            <div class="flex items-center">
              <div class="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
                <Icon name="heroicons:eye" class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Viewer Role</h3>
                <p class="text-sm text-gray-600">Read-only access</p>
              </div>
            </div>
          </div>
          <div class="card-body">
            <ul class="space-y-2">
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                View leads and activities
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                Access analytics
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                View reports
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:x-mark" class="w-4 h-4 text-red-500 mr-2" />
                Cannot create or edit
              </li>
              <li class="flex items-center text-sm text-gray-600">
                <Icon name="heroicons:x-mark" class="w-4 h-4 text-red-500 mr-2" />
                Cannot manage users
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Reactive data
const roleStats = ref({
  admin: 0,
  sales_manager: 0,
  account_manager: 0,
  sales_rep: 0,
  customer_success: 0,
  marketing: 0,
  support: 0,
  viewer: 0
})

// Permission matrix data
const permissionMatrix = ref([
  {
    name: 'Users',
    description: 'User management and administration',
    icon: 'heroicons:users',
    actions: ['create', 'read', 'update', 'delete', 'assign_role']
  },
  {
    name: 'Leads',
    description: 'Lead management and tracking',
    icon: 'heroicons:user-plus',
    actions: ['create', 'read', 'update', 'delete', 'assign', 'export']
  },
  {
    name: 'Activities',
    description: 'Activity tracking and management',
    icon: 'heroicons:calendar',
    actions: ['create', 'read', 'update', 'delete', 'bulk_create']
  },
  {
    name: 'Analytics',
    description: 'Data analytics and insights',
    icon: 'heroicons:chart-bar',
    actions: ['read', 'export', 'dashboard']
  },
  {
    name: 'Settings',
    description: 'System configuration',
    icon: 'heroicons:cog',
    actions: ['read', 'update', 'system']
  },
  {
    name: 'Assignment Rules',
    description: 'Lead assignment automation',
    icon: 'heroicons:adjustments-horizontal',
    actions: ['create', 'read', 'update', 'delete', 'activate']
  },
  {
    name: 'Email',
    description: 'Email management and campaigns',
    icon: 'heroicons:envelope',
    actions: ['create', 'read', 'update', 'delete', 'send', 'templates']
  },
  {
    name: 'AI',
    description: 'AI-powered features and insights',
    icon: 'heroicons:sparkles',
    actions: ['create', 'read', 'update', 'delete', 'analyze', 'generate']
  }
])

// Methods
const getRoleActions = (resourceName, role) => {
  const resource = resourceName.toLowerCase().replace(' ', '-')
  const rolePermissions = {
    admin: ['create', 'read', 'update', 'delete', 'assign_role', 'export', 'dashboard', 'system', 'activate', 'send', 'templates', 'analyze', 'generate', 'bulk_create'],
    sales_manager: ['create', 'read', 'update', 'delete', 'export', 'dashboard', 'activate', 'send', 'templates', 'analyze', 'generate', 'bulk_create'],
    account_manager: ['create', 'read', 'update', 'delete', 'export', 'send', 'templates', 'analyze', 'generate', 'bulk_create'],
    sales_rep: ['create', 'read', 'update', 'delete', 'export', 'send', 'templates', 'analyze', 'generate', 'bulk_create'],
    customer_success: ['create', 'read', 'update', 'delete', 'export', 'send', 'templates', 'analyze', 'generate', 'bulk_create'],
    marketing: ['create', 'read', 'update', 'delete', 'export', 'dashboard', 'send', 'templates', 'campaigns', 'analyze', 'generate', 'bulk_create'],
    support: ['create', 'read', 'update', 'delete', 'export', 'send', 'templates', 'analyze', 'generate', 'bulk_create'],
    viewer: ['read']
  }
  
  return rolePermissions[role] || []
}

const getActionBadgeClass = (action, role) => {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
  
  if (role === 'admin') {
    return `${baseClasses} bg-green-100 text-green-800`
  } else if (role === 'sales_manager') {
    return `${baseClasses} bg-purple-100 text-purple-800`
  } else if (role === 'account_manager') {
    return `${baseClasses} bg-blue-100 text-blue-800`
  } else if (role === 'sales_rep') {
    return `${baseClasses} bg-green-100 text-green-800`
  } else if (role === 'customer_success') {
    return `${baseClasses} bg-yellow-100 text-yellow-800`
  } else if (role === 'marketing') {
    return `${baseClasses} bg-pink-100 text-pink-800`
  } else if (role === 'support') {
    return `${baseClasses} bg-orange-100 text-orange-800`
  } else {
    return `${baseClasses} bg-gray-100 text-gray-800`
  }
}

const loadRoleStats = async () => {
  try {
    // Get authentication token
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
      roleStats.value = response.data.summary
    }
  } catch (error) {
    console.error('Error loading role stats:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadRoleStats()
})

// Meta
definePageMeta({
  layout: 'default',
  auth: true
})
</script>
