import { getUserFromCookie, getUserFromLocalStorage } from '~/utils'

export default defineNuxtRouteMiddleware(() => {
  const newsStore = useNewsStore()

  const userData = import.meta.server
    ? getUserFromCookie()
    : getUserFromLocalStorage()

  if (!userData) {
    return
  }

  const expiresIn = Number(userData.expiresIn)

  if (!userData.jwt || Date.now() > expiresIn) {
    newsStore.clearToken()
    newsStore.clearUser()
  } else {
    newsStore.setToken(userData.jwt)
    newsStore.setUser({
      email: userData.user!,
      avatar: userData.avatar!,
    })
    const timeToLogout = expiresIn - Date.now()
    newsStore.setLogoutTimer(timeToLogout)
  }
})
