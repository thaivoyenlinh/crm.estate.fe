import axios from "axios"

import { ErrorResponse } from "../api-response.type"
import { API_URL } from "../config"
import { AuthError } from "./auth.error"
import { AuthLoginRequest, AuthLoginResponse } from "./auth.type"
import { AUTH_PATH } from "./auth.constant"

const authClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data as Partial<ErrorResponse> | undefined
      const retryAfterSeconds = error.response.headers["retry-after"]

      throw new AuthError(
        data?.code ?? "unknown_error",
        error.response.status,
        data?.title,
        retryAfterSeconds ? Number(retryAfterSeconds) : undefined,
      )
    }

    throw error
  },
)

export const postLogin = async (data: AuthLoginRequest): Promise<AuthLoginResponse> => {
  const response = await authClient.post<AuthLoginResponse>(AUTH_PATH.login, data)
  return response.data
}
