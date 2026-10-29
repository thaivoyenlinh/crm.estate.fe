export interface AuthLoginRequest {
  email: string
  password: string
}

export interface AuthLoginResponse {
  accessToken: string
  expiresIn: number
}

export interface AuthUser {
  email: string
  id: string
  name: string
}
