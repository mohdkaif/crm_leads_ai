<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Users</h1>
            <p class="text-gray-600">Manage team members and their permissions</p>
          </div>
          <button class="btn-primary">
            <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      <!-- Users List -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold text-gray-900">Team Members</h3>
        </div>
        <div class="card-body p-0">
          <div class="overflow-hidden">
            <table class="table">
              <thead class="table-header">
                <tr>
                  <th class="table-header-cell">User</th>
                  <th class="table-header-cell">Role</th>
                  <th class="table-header-cell">Department</th>
                  <th class="table-header-cell">Status</th>
                  <th class="table-header-cell">Last Login</th>
                  <th class="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody class="table-body">
                <tr v-for="user in users" :key="user.id" class="table-row">
                  <td class="table-cell">
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-4">
                        {{ user.name.charAt(0) }}
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{{ user.name }}</p>
                        <p class="text-sm text-gray-600">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="table-cell">
                    <span class="badge" :class="getRoleBadgeClass(user.role)">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="table-cell">
                    <span class="text-sm text-gray-900">{{ user.department || 'N/A' }}</span>
                  </td>
                  <td class="table-cell">
                    <span class="badge" :class="user.isActive ? 'badge-success' : 'badge-danger'">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="table-cell">
                    <span class="text-sm text-gray-900">{{ formatDate(user.lastLogin) }}</span>
                  </td>
                  <td class="table-cell">
                    <div class="flex items-center space-x-2">
                      <button class="text-blue-600 hover:text-blue-800">
                        <Icon name="heroicons:pencil" class="w-4 h-4" />
                      </button>
                      <button class="text-green-600 hover:text-green-800">
                        <Icon name="heroicons:key" class="w-4 h-4" />
                      </button>
                      <button class="text-red-600 hover:text-red-800">
                        <Icon name="heroicons:trash" class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Role Permissions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Role Permissions</h3>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div v-for="role in roles" :key="role.name" class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-medium text-gray-900">{{ role.name }}</h4>
                  <span class="badge" :class="getRoleBadgeClass(role.name.toLowerCase())">
                    {{ role.userCount }} users
                  </span>
                </div>
                <div class="space-y-2">
                  <div v-for="permission in role.permissions" :key="permission" class="flex items-center">
                    <Icon name="heroicons:check" class="w-4 h-4 text-green-500 mr-2" />
                    <span class="text-sm text-gray-600">{{ permission }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div class="card-body">
            <div class="space-y-4">
              <div v-for="activity in userActivities" :key="activity.id" class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon :name="activity.icon" class="w-4 h-4 text-blue-600" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ activity.description }}</p>
                  <p class="text-xs text-gray-500">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Reactive data
const users = ref([
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'admin',
    department: 'Management',
    isActive: true,
    lastLogin: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    role: 'manager',
    department: 'Sales',
    isActive: true,
    lastLogin: '2024-01-15T09:15:00Z'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    role: 'sales',
    department: 'Sales',
    isActive: true,
    lastLogin: '2024-01-14T16:45:00Z'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    role: 'sales',
    department: 'Sales',
    isActive: false,
    lastLogin: '2024-01-10T14:20:00Z'
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@company.com',
    role: 'viewer',
    department: 'Marketing',
    isActive: true,
    lastLogin: '2024-01-15T11:00:00Z'
  }
])

const roles = ref([
  {
    name: 'Admin',
    userCount: 1,
    permissions: [
      'Full system access',
      'User management',
      'System settings',
      'All lead operations',
      'Analytics access'
    ]
  },
  {
    name: 'Manager',
    userCount: 1,
    permissions: [
      'Team management',
      'Lead management',
      'Analytics access',
      'User oversight'
    ]
  },
  {
    name: 'Sales',
    userCount: 2,
    permissions: [
      'Lead management',
      'Activity tracking',
      'Basic analytics'
    ]
  },
  {
    name: 'Viewer',
    userCount: 1,
    permissions: [
      'Read-only access',
      'Basic reports'
    ]
  }
])

const userActivities = ref([
  {
    id: 1,
    description: 'John Doe logged in',
    time: '2 minutes ago',
    icon: 'heroicons:arrow-right-on-rectangle'
  },
  {
    id: 2,
    description: 'Jane Smith updated lead status',
    time: '15 minutes ago',
    icon: 'heroicons:pencil'
  },
  {
    id: 3,
    description: 'Mike Johnson created new lead',
    time: '1 hour ago',
    icon: 'heroicons:user-plus'
  },
  {
    id: 4,
    description: 'Sarah Wilson password reset',
    time: '2 hours ago',
    icon: 'heroicons:key'
  },
  {
    id: 5,
    description: 'David Brown viewed analytics',
    time: '3 hours ago',
    icon: 'heroicons:chart-bar'
  }
])

// Methods
const getRoleBadgeClass = (role) => {
  const classes = {
    admin: 'badge-danger',
    manager: 'badge-warning',
    sales: 'badge-success',
    viewer: 'badge-gray'
  }
  return classes[role] || 'badge-gray'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

// Meta
definePageMeta({
  layout: 'default',
  auth: true
})
</script>
