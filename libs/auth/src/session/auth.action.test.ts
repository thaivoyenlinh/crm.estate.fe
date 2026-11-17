import { beforeEach, describe, expect, it, vi } from "vitest"

import { logout } from "./auth.action"
import { postLogout } from "./auth.api"
import { getAccessToken, getUser, setSession } from "./auth.state"
import { AuthUser } from "./auth.type"

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
