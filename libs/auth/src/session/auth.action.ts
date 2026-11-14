import { API_ERROR_CODES } from "../shared"
import { getMe, postLogin, postLogout, postRefresh } from "./auth.api"
import { AUTH_REFRESH_LOCK } from "./auth.constant"
import { AuthError } from "./auth.error"
import { clearSession, setAccessToken, setSession } from "./auth.state"

let refreshPromise: Promise<string> | null = null

export const login = async (email: string, password: string) => {
  const { accessToken } = await postLogin({ email, password })
  const user = await getMe(accessToken)
  setSession(accessToken, user)
}

const renewAccessToken = (): Promise<string> =>
  navigator.locks.request(AUTH_REFRESH_LOCK, async () => {
    const { accessToken } = await postRefresh()
    setAccessToken(accessToken)
    return accessToken
  })

export const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise

  refreshPromise = renewAccessToken()

  try {
    return await refreshPromise
  } catch (error) {
    if (error instanceof AuthError && error.code === API_ERROR_CODES.REFRESH_INVALID) clearSession()
    throw error
  } finally {
    refreshPromise = null
  }
}

export const restoreSession = async () => {
  try {
    const accessToken = await refreshAccessToken()
    const user = await getMe(accessToken)
    setSession(accessToken, user)
    return true
  } catch (error) {
    const isSessionEnded =
      error instanceof AuthError &&
      (error.code === API_ERROR_CODES.REFRESH_INVALID ||
        error.code === API_ERROR_CODES.TOKEN_INVALID)

    if (isSessionEnded) return false

    throw error
  }
}

export const logout = async () => {
  try {
    await postLogout()
  } finally {
    clearSession()
  }
}
