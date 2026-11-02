import { getMe, postLogin, postRefresh } from "./auth.api"
import { setAccessToken, setSession } from "./auth.state"

let refreshPromise: Promise<void> | null = null

export const login = async (email: string, password: string) => {
  const { accessToken } = await postLogin({ email, password })
  const user = await getMe(accessToken)
  setSession(accessToken, user)
}

const getRefreshAccessToken = async (): Promise<void> => {
  const { accessToken } = await postRefresh()
  setAccessToken(accessToken)
}

export const refreshAccessToken = async () => {
  if (refreshPromise) return refreshPromise

  refreshPromise = getRefreshAccessToken()

  try {
    await refreshPromise
  } finally {
    refreshPromise = null
  }
}
