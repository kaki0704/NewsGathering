import type { AuthResponse, User, UserData } from '~/types'

const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
  sameSite: 'lax' as const,
}

export const saveUserData = (
  authData: Pick<AuthResponse, 'idToken' | 'expiresIn'>,
  user: User,
): void => {
  const tokenExpiration = Date.now() + Number(authData.expiresIn) * 1000

  if (import.meta.client) {
    localStorage.setItem('jwt', authData.idToken)
    localStorage.setItem('expiresIn', String(tokenExpiration))
    localStorage.setItem('user', user.email)
    localStorage.setItem('avatar', user.avatar)
  }

  const jwt = useCookie('jwt', COOKIE_OPTIONS)
  const expiresIn = useCookie('expiresIn', COOKIE_OPTIONS)
  const userCookie = useCookie('user', COOKIE_OPTIONS)
  const avatarCookie = useCookie('avatar', COOKIE_OPTIONS)

  jwt.value = authData.idToken
  expiresIn.value = String(tokenExpiration)
  userCookie.value = user.email
  avatarCookie.value = user.avatar
}

export const getUserFromCookie = (): UserData | null => {
  const jwt = useCookie<string | null>('jwt')
  const expiresIn = useCookie<string | null>('expiresIn')
  const user = useCookie<string | null>('user')
  const avatar = useCookie<string | null>('avatar')

  if (!jwt.value || !expiresIn.value || !user.value || !avatar.value) {
    return null
  }

  return {
    jwt: jwt.value,
    expiresIn: expiresIn.value,
    user: user.value,
    avatar: avatar.value,
  }
}

export const getUserFromLocalStorage = (): UserData | null => {
  if (!import.meta.client) {
    return null
  }

  const jwt = localStorage.getItem('jwt')
  const expiresIn = localStorage.getItem('expiresIn')
  const user = localStorage.getItem('user')
  const avatar = localStorage.getItem('avatar')

  if (!jwt || !expiresIn || !user || !avatar) {
    return null
  }

  return { jwt, expiresIn, user, avatar }
}

export const clearUserData = (): void => {
  if (import.meta.client) {
    localStorage.removeItem('jwt')
    localStorage.removeItem('expiresIn')
    localStorage.removeItem('user')
    localStorage.removeItem('avatar')
  }

  const jwt = useCookie('jwt')
  const expiresIn = useCookie('expiresIn')
  const user = useCookie('user')
  const avatar = useCookie('avatar')

  jwt.value = null
  expiresIn.value = null
  user.value = null
  avatar.value = null
}
