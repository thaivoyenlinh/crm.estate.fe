export class AuthError extends Error {
  public code: string
  public status: number
  public retryAfterSeconds?: number

  constructor(code: string, status: number, message?: string, retryAfterSeconds?: number) {
    super(message)

    this.name = "AuthError"
    this.code = code
    this.status = status
    this.retryAfterSeconds = retryAfterSeconds
  }
}
