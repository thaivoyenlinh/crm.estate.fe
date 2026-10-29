import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"

import { ErrorResponse } from "../api-response.type"
import { API_URL } from "../config"
import { refreshAccessToken } from "../session/auth.action"
import { getAccessToken } from "../session/auth.state"

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
    status === 401 && response?.data?.code === "token_invalid" && config && !config.isRetry

  if (canRetry) return handle401Error(config)

  throw error
}

const handle401Error = async (config: InternalAxiosRequestConfig) => {
  config.isRetry = true
  await refreshAccessToken()
  return apiClient(config)
}
