import axios from "axios"

import { ErrorResponse } from "../api-response.type"
import { API_URL } from "../config"
import { AUTH_PATH } from "./auth.constant"
import { AuthError } from "./auth.error"
import { AuthLoginRequest, AuthLoginResponse, AuthUser } from "./auth.type"

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

export const getMe = async (accessToken: string): Promise<AuthUser> => {
  const headers = { authorization: `Bearer ${accessToken}` }
  const response = await authClient.get<AuthUser>(AUTH_PATH.me, { headers })
  return response.data
}

export const postLogin = async (data: AuthLoginRequest): Promise<AuthLoginResponse> => {
  const response = await authClient.post<AuthLoginResponse>(AUTH_PATH.login, data)
  return response.data
}
