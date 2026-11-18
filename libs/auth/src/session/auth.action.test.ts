import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { API_ERROR_CODES } from "../shared"
import { logout, restoreSession } from "./auth.action"
import { getMe, postLogout, postRefresh } from "./auth.api"
import { AuthError } from "./auth.error"
import { clearSession, getAccessToken, getUser, setSession } from "./auth.state"
import { AuthTokenResponse, AuthUser } from "./auth.type"

vi.mock("./auth.api")

describe("auth action logout", () => {
  const user: AuthUser = { email: "test@example.com", id: "u1", name: "Test" }
  const token = "token test"

  beforeEach(() => {
    vi.resetAllMocks()
    setSession(token, user)
  })

  it("clears the session when the server call succeeds", async () => {
    vi.mocked(postLogout).mockResolvedValue()

    await logout()

    expect(postLogout).toHaveBeenCalledTimes(1)
    expect(getUser()).toBeNull()
    expect(getAccessToken()).toBeNull()
  })

  it("rethrows and still clears the session when the server call fails", async () => {
    vi.mocked(postLogout).mockRejectedValue(new Error("error"))

    await expect(logout()).rejects.toThrow("error")

    expect(postLogout).toHaveBeenCalledTimes(1)
    expect(getUser()).toBeNull()
    expect(getAccessToken()).toBeNull()
  })
})

describe("auth action restoreSession", () => {
  const tokenResponse: AuthTokenResponse = {
    accessToken: "token",
    expiresIn: 15,
  }
  const user: AuthUser = { email: "test@example.com", id: "u1", name: "Test" }

  const stubWebLocks = () => {
    vi.stubGlobal("navigator", {
      locks: {
        request: (_name: string, callback: () => Promise<string>) => callback(),
      },
    })
  }

  beforeEach(() => {
    vi.resetAllMocks()
    clearSession()

    stubWebLocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns true and stores the session when refresh and getMe succeed", async () => {
    vi.mocked(postRefresh).mockResolvedValue(tokenResponse)
    vi.mocked(getMe).mockResolvedValue(user)

    await expect(restoreSession()).resolves.toBe(true)
    expect(getAccessToken()).toBe(tokenResponse.accessToken)
    expect(getUser()).toEqual(user)
  })

  it("returns false when the refresh token is invalid", async () => {
    vi.mocked(postRefresh).mockRejectedValue(new AuthError(API_ERROR_CODES.REFRESH_INVALID, 401))

    await expect(restoreSession()).resolves.toBe(false)
    expect(getMe).not.toHaveBeenCalled()
  })

  it("returns false when the refreshed access token is rejected", async () => {
    vi.mocked(postRefresh).mockResolvedValue(tokenResponse)
    vi.mocked(getMe).mockRejectedValue(new AuthError(API_ERROR_CODES.TOKEN_INVALID, 401))

    await expect(restoreSession()).resolves.toBe(false)
    expect(getAccessToken()).toBeNull()
    expect(getUser()).toBeNull()
  })

  it("rethrows unexpected errors such as a network failure", async () => {
    vi.mocked(postRefresh).mockRejectedValue(new Error("network"))

    await expect(restoreSession()).rejects.toThrow("network")
  })
})
