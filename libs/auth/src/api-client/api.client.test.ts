import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest"

import { refreshAccessToken } from "../session/auth.action"
import {
  clearSession,
  getAccessToken,
  getUser,
  setAccessToken,
  setSession,
} from "../session/auth.state"
import { AuthUser } from "../session/auth.type"
import { API_ERROR_CODES } from "../shared"
import { apiClient } from "./api.client"

const leads = [
  {
    id: 1,
    title: "first leads title",
    content: "first leads content",
  },
]

const user: AuthUser = { email: "test@example.com", id: "u1", name: "Test" }
const token = "token test"

vi.mock("../session/auth.action")

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterAll(() => server.close())
beforeEach(() => {
  clearSession()
  vi.resetAllMocks()
})
afterEach(() => server.resetHandlers())

it("sends the access token when there is a session", async () => {
  let receivedAuth: string | null = null

  setSession(token, user)

  server.use(
    http.get("http://api.test/leads", ({ request }) => {
      receivedAuth = request.headers.get("authorization")
      return HttpResponse.json(leads)
    }),
  )

  await apiClient.get("/leads")

  expect(receivedAuth).toBe(`Bearer ${token}`)
})

it("sends no authorization header without a session", async () => {
  let receivedAuth: string | null | undefined

  server.use(
    http.get("http://api.test/leads", ({ request }) => {
      receivedAuth = request.headers.get("authorization")
      return HttpResponse.json(leads)
    }),
  )

  await apiClient.get("/leads")

  expect(receivedAuth).toBeNull()
})

it("rethrows server errors without refreshing", async () => {
  server.use(
    http.get("http://api.test/leads", () => {
      return HttpResponse.json({}, { status: 500 })
    }),
  )

  await expect(apiClient.get("/leads")).rejects.toMatchObject({ response: { status: 500 } })

  expect(refreshAccessToken).not.toHaveBeenCalled()
})

it("rethrows 401 errors that are not token_invalid without refreshing", async () => {
  server.use(
    http.get("http://api.test/leads", () => {
      return HttpResponse.json({}, { status: 401 })
    }),
  )

  await expect(apiClient.get("/leads")).rejects.toMatchObject({ response: { status: 401 } })

  expect(refreshAccessToken).not.toHaveBeenCalled()
})

it("refreshes and retries once when the access token is invalid", async () => {
  const newToken = "new token"
  let requestCount = 0
  let retryAuth: string | null | undefined

  setSession(token, user)
  vi.mocked(refreshAccessToken).mockImplementation(async () => {
    setAccessToken(newToken)
    return newToken
  })
  server.use(
    http.get("http://api.test/leads", ({ request }) => {
      requestCount++

      if (requestCount === 1) {
        return HttpResponse.json({ code: API_ERROR_CODES.TOKEN_INVALID }, { status: 401 })
      }

      retryAuth = request.headers.get("authorization")
      return HttpResponse.json(leads)
    }),
  )

  const { data } = await apiClient.get("/leads")

  expect(data).toEqual(leads)
  expect(refreshAccessToken).toHaveBeenCalledTimes(1)
  expect(requestCount).toBe(2)
  expect(retryAuth).toBe(`Bearer ${newToken}`)
})

it("clears the session and stops retrying when the retry is still unauthorized", async () => {
  const newToken = "new token"
  let requestCount = 0

  setSession(token, user)
  vi.mocked(refreshAccessToken).mockImplementation(async () => {
    setAccessToken(newToken)
    return newToken
  })
  server.use(
    http.get("http://api.test/leads", () => {
      requestCount++
      return HttpResponse.json({ code: API_ERROR_CODES.TOKEN_INVALID }, { status: 401 })
    }),
  )

  await expect(apiClient.get("/leads")).rejects.toMatchObject({ response: { status: 401 } })

  expect(refreshAccessToken).toHaveBeenCalledTimes(1)
  expect(requestCount).toBe(2)
  expect(getAccessToken()).toBeNull()
  expect(getUser()).toBeNull()
})
