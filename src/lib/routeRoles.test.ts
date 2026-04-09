import { describe, expect, it, vi } from "vitest";
import { assertRouteRoleAccess } from "./routeRoles";
import * as rbac from "./rbac";

describe("route role access", () => {
  it("redirects when role lookup fails", async () => {
    vi.spyOn(rbac, "fetchUserRoles").mockResolvedValueOnce({
      roles: [],
      error: new Error("boom"),
    });
    const out = await assertRouteRoleAccess({} as never, "/founder-dashboard");
    expect(out).toEqual({ ok: false, redirectTo: "/feed" });
  });

  it("allows founder route for admin role", async () => {
    vi.spyOn(rbac, "fetchUserRoles").mockResolvedValueOnce({
      roles: ["admin"],
      error: null,
    });
    const out = await assertRouteRoleAccess({} as never, "/founder-dashboard");
    expect(out).toEqual({ ok: true, roles: ["admin"] });
  });

  it("blocks moderator from ambassador-only route", async () => {
    vi.spyOn(rbac, "fetchUserRoles").mockResolvedValueOnce({
      roles: ["moderator"],
      error: null,
    });
    const out = await assertRouteRoleAccess({} as never, "/ambassador-dashboard");
    expect(out).toEqual({ ok: false, redirectTo: "/feed" });
  });

  it("supports trailing slash route normalization", async () => {
    vi.spyOn(rbac, "fetchUserRoles").mockResolvedValueOnce({
      roles: ["founder"],
      error: null,
    });
    const out = await assertRouteRoleAccess({} as never, "/founder-dashboard/");
    expect(out).toEqual({ ok: true, roles: ["founder"] });
  });
});
