import "axios"

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    isRetry?: boolean
  }
}
