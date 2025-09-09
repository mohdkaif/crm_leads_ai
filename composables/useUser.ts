export const useUser = () => {
  const user = ref(null)

  const setUser = (userData: any) => {
    user.value = userData
  }

  const clearUser = () => {
    user.value = null
  }

  const isAuthenticated = computed(() => !!user.value)

  return {
    user: readonly(user),
    setUser,
    clearUser,
    isAuthenticated
  }
}
