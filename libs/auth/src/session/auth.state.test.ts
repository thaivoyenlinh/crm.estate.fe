import { beforeEach, describe, expect, it } from "vitest"

import { clearSession, getAccessToken, getUser, setAccessToken, setSession } from "./auth.state"
import { AuthUser } from "./auth.type"

describe("auth state", () => {
  const user: AuthUser = { email: "test@example.com", id: "u1", name: "Test" }
  const token = "token test"

  beforeEach(() => {
    clearSession()
  })

  it("returns user and token after set session", () => {
    setSession(token, user)

    expect(getAccessToken()).toBe(token)
    expect(getUser()).toEqual(user)
  })

  it("returns null user when there is no session", () => {
    expect(getUser()).toBeNull()
  })

  it("returns null user and token after clear session", () => {
    setSession(token, user)

    clearSession()

    expect(getUser()).toBeNull()
    expect(getAccessToken()).toBeNull()
  })

  describe("setAccessToken", () => {
    const newToken = "new token"

    it("keeps the user when replacing the token", () => {
      setSession(token, user)

      setAccessToken(newToken)

      expect(getAccessToken()).toBe(newToken)
      expect(getUser()).toEqual(user)
    })

    it("does not create a session when there is none", () => {
      setAccessToken(newToken)

      expect(getAccessToken()).toBeNull()
      expect(getUser()).toBeNull()
    })
  })
})
