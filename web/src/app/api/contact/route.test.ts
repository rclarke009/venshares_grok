import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

function jsonRequest(
  body: unknown,
  headers?: Record<string, string>,
): NextRequest {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("CONTACT_FUNCTION_URL", "https://example.test/functions/v1/send-email");
    vi.stubEnv("CONTACT_FORM_KEY", "test-form-key");
    globalThis.fetch = mockFetch as typeof fetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 200 and forwards to Edge Function when upstream ok", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ message: "sent" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { POST } = await import("./route");
    const req = jsonRequest(
      { name: "Ann", email: "ann@example.com", message: "Hello" },
      { "x-forwarded-for": "192.0.2.10" },
    );
    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://example.test/functions/v1/send-email",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Contact-Form-Key": "test-form-key",
        }),
      }),
    );
    const init = mockFetch.mock.calls[0]![1] as RequestInit;
    expect(JSON.parse(init.body as string)).toEqual({
      name: "Ann",
      email: "ann@example.com",
      message: "Hello",
    });
  });

  it("returns 400 for invalid JSON", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.0.2.11" },
      body: "not-json{",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns 400 for validation errors", async () => {
    const { POST } = await import("./route");
    const req = jsonRequest(
      { name: "", email: "bad", message: "x" },
      { "x-forwarded-for": "192.0.2.12" },
    );
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns 502 when upstream fails", async () => {
    mockFetch.mockResolvedValue(new Response("upstream error", { status: 500 }));

    const { POST } = await import("./route");
    const req = jsonRequest(
      { name: "Ann", email: "ann@example.com", message: "Hello" },
      { "x-forwarded-for": "192.0.2.13" },
    );
    const res = await POST(req);
    expect(res.status).toBe(502);
  });

  it("returns 503 when contact env is not configured", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("CONTACT_FUNCTION_URL", "");
    vi.stubEnv("CONTACT_FORM_KEY", "");

    const { POST } = await import("./route");
    const req = jsonRequest(
      { name: "Ann", email: "ann@example.com", message: "Hello" },
      { "x-forwarded-for": "192.0.2.14" },
    );
    const res = await POST(req);
    expect(res.status).toBe(503);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns 429 after 5 requests for the same IP within the window", async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      ),
    );

    const { POST } = await import("./route");
    const ip = "192.0.2.99";
    const body = { name: "Ann", email: "ann@example.com", message: "Hello" };

    for (let i = 0; i < 5; i++) {
      const res = await POST(jsonRequest(body, { "x-forwarded-for": ip }));
      expect(res.status).toBe(200);
    }

    const sixth = await POST(jsonRequest(body, { "x-forwarded-for": ip }));
    expect(sixth.status).toBe(429);
    expect(mockFetch).toHaveBeenCalledTimes(5);
  });
});
