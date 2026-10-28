import { postLogin } from "./auth.api"

export const login = (email: string, password: string) => {
  return postLogin({ email, password })
}
