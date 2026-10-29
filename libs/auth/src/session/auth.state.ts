import { AuthUser } from "./auth.type"

interface Session {
  accessToken: string
  user: Readonly<AuthUser>
}

let session: Readonly<Session> | null = null

export const getToken = () => session?.accessToken ?? null
export const getUser = () => session?.user ?? null

export const setSession = (accessToken: string, user: AuthUser) => {
  session = Object.freeze({ accessToken, user: Object.freeze(user) } satisfies Session)
}
