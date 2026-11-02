import axios from "axios"

import { API_URL, ErrorResponse } from "../shared"
import { AuthError } from "./auth.error"

export const authClient = axios.create({
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
