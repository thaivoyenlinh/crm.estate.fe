export interface AuthLoginRequest {
  email: string
  password: string
}

export interface AuthLoginResponse {
  accessToken: string
  expiresIn: number
}
