import axios, { AxiosError, HttpStatusCode } from "axios"

import { refreshAccessToken } from "../session/auth.action"
import { clearSession, getAccessToken } from "../session/auth.state"
import { API_ERROR_CODES, API_URL, ErrorResponse } from "../shared"

type ApiError = AxiosError<Partial<ErrorResponse | undefined>>

export const apiClient = axios.create({
  baseURL: API_URL,
})

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      return handleError(error)
    }

    throw error
  },
)

const handleError = (error: ApiError) => {
  const { response, status } = error

  const isTokenInvalid =
    status === HttpStatusCode.Unauthorized && response?.data?.code === API_ERROR_CODES.TOKEN_INVALID

  if (!isTokenInvalid) throw error
  return handleTokenInvalid(error)
}

const handleTokenInvalid = async (error: ApiError) => {
  const config = error.config
  const canRetry = config && !config.isRetry

  if (canRetry) {
    config.isRetry = true
    await refreshAccessToken()
    return apiClient(config)
  }

  clearSession()
  throw error
}
