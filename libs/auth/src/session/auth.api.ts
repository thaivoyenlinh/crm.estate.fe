import { authClient } from "./auth.client"
import { AUTH_PATHS } from "./auth.constant"
import { AuthLoginRequest, AuthTokenResponse, AuthUser } from "./auth.type"

export const getMe = async (accessToken: string): Promise<AuthUser> => {
  const headers = { authorization: `Bearer ${accessToken}` }
  const response = await authClient.get<AuthUser>(AUTH_PATHS.ME, { headers })
  return response.data
}

export const postLogin = async (data: AuthLoginRequest): Promise<AuthTokenResponse> => {
  const response = await authClient.post<AuthTokenResponse>(AUTH_PATHS.LOGIN, data)
  return response.data
}

export const postRefresh = async (): Promise<AuthTokenResponse> => {
  const response = await authClient.post<AuthTokenResponse>(AUTH_PATHS.REFRESH, undefined, {
    headers: { "x-requested-with": "fetch" },
  })
  return response.data
}
