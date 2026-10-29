import { getMe, postLogin, postRefresh } from "./auth.api"
import { setAccessToken, setSession } from "./auth.state"

export const login = async (email: string, password: string) => {
  const { accessToken } = await postLogin({ email, password })
  const user = await getMe(accessToken)
  setSession(accessToken, user)
}

export const refreshAccessToken = async () => {
  const { accessToken } = await postRefresh()
  setAccessToken(accessToken)
}
