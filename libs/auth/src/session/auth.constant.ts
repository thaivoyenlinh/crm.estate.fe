export const AUTH_PATHS = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  ME: "/me",
  REFRESH: "/auth/refresh",
} as const

export const AUTH_REFRESH_LOCK = "auth-refresh-lock"
