import { describe, expect, it } from "vitest";
import { hasRole, isStaff, type AppRole } from "./rbac";

describe("rbac helpers", () => {
  it("hasRole matches any listed role", () => {
    const roles: AppRole[] = ["user", "ambassador"];
    expect(hasRole(roles, "founder")).toBe(false);
    expect(hasRole(roles, "ambassador")).toBe(true);
  });

  it("isStaff is true for founder, admin, moderator", () => {
    expect(isStaff(["moderator"])).toBe(true);
    expect(isStaff(["ambassador"])).toBe(false);
    expect(isStaff(["user"])).toBe(false);
  });
});
