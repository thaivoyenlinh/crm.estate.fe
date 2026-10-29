import { getMe, postLogin } from "./auth.api"
import { setSession } from "./auth.state"

export const login = async (email: string, password: string) => {
  const { accessToken } = await postLogin({ email, password })
  const user = await getMe(accessToken)
  setSession(accessToken, user)
}
