import { API_ERROR_CODES } from "../shared"
import { getMe, postLogin, postRefresh } from "./auth.api"
import { AUTH_REFRESH_LOCK } from "./auth.constant"
import { AuthError } from "./auth.error"
import { clearSession, setAccessToken, setSession } from "./auth.state"

let refreshPromise: Promise<void> | null = null

export const login = async (email: string, password: string) => {
  const { accessToken } = await postLogin({ email, password })
  const user = await getMe(accessToken)
  setSession(accessToken, user)
}

export const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise

  refreshPromise = renewAccessToken()

  try {
    await refreshPromise
  } catch (error) {
    if (error instanceof AuthError && error.code === API_ERROR_CODES.REFRESH_INVALID) clearSession()
    throw error
  } finally {
    refreshPromise = null
  }
}

const renewAccessToken = () =>
  navigator.locks.request(AUTH_REFRESH_LOCK, async () => {
    const { accessToken } = await postRefresh()
    setAccessToken(accessToken)
  })
