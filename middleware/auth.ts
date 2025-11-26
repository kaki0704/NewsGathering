export default defineNuxtRouteMiddleware(() => {
  const newsStore = useNewsStore()

  if (newsStore.isAuthenticated) {
    return navigateTo('/')
  }
})
