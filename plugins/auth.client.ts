export default defineNuxtPlugin(async () => {
  const { fetchUser } = useAuth()
  
  try {
    await fetchUser()
  } catch (error) {
    // User is not authenticated, redirect to login
    if (process.client) {
      const route = useRoute()
      if (route.path !== '/login' && route.path !== '/register') {
        await navigateTo('/login')
      }
    }
  }
})
