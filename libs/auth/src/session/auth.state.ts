import { AuthUser } from "./auth.type"

interface Session {
  accessToken: string
  user: Readonly<AuthUser>
}

let session: Readonly<Session> | null = null

export const getAccessToken = () => session?.accessToken ?? null
export const getUser = () => session?.user ?? null

export const setSession = (accessToken: string, user: AuthUser) => {
  session = Object.freeze({ accessToken, user: Object.freeze(user) } satisfies Session)
}

export const setAccessToken = (accessToken: string) => {
  if (session) {
    session = Object.freeze({ ...session, accessToken })
  }
}

export const clearSession = () => {
  session = null
}
