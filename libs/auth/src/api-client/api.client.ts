import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"

import { refreshAccessToken } from "../session/auth.action"
import { getAccessToken } from "../session/auth.state"
import { API_ERROR_CODES, API_URL, ErrorResponse } from "../shared"

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

const handleError = (error: AxiosError<Partial<ErrorResponse | undefined>>) => {
  const { config, response, status } = error
  const canRetry =
    status === 401 &&
    response?.data?.code === API_ERROR_CODES.TOKEN_INVALID &&
    config &&
    !config.isRetry

  if (canRetry) return handle401Error(config)

  throw error
}

const handle401Error = async (config: InternalAxiosRequestConfig) => {
  config.isRetry = true
  await refreshAccessToken()
  return apiClient(config)
}
