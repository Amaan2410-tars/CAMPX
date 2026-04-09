import { expect, test } from "@playwright/test";

test("public pages render core launch entry points", async ({ page }) => {
  await page.goto("/prototypes.html", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /CampX HTML prototypes/i })).toBeVisible();

  await page.goto("/campx-user-tiers.html", { waitUntil: "domcontentloaded" });
  if (page.url().includes("/auth/login")) {
    await expect(page.locator("body")).toContainText(/login|sign in|welcome/i);
  } else {
    await expect(page.getByRole("heading", { name: /choose your campx plan/i })).toBeVisible();
  }

  await page.goto("/campx-subscription-billing.html?plan=pro", { waitUntil: "domcontentloaded" });
  if (page.url().includes("/auth/login")) {
    await expect(page.locator("body")).toContainText(/login|sign in|welcome/i);
  } else {
    await expect(page.getByRole("heading", { name: /secure checkout/i })).toBeVisible();
  }
});

test("edge function endpoint is reachable and protected", async ({ request }) => {
  const res = await request.post(
    "https://zxtagxxgeyparxpuuwft.supabase.co/functions/v1/razorpay-create-order",
    {
      data: { plan_id: "00000000-0000-0000-0000-000000000000" },
    },
  );

  // Gateway should reject unauthenticated calls, which confirms route health.
  expect(res.status()).toBe(401);
});

test("authenticated billing flow can initialize checkout", async ({ page }) => {
  const email = process.env.RELEASE_TEST_EMAIL;
  const password = process.env.RELEASE_TEST_PASSWORD;
  test.skip(!email || !password, "Missing RELEASE_TEST_EMAIL / RELEASE_TEST_PASSWORD secrets.");

  await page.goto("/auth/login", { waitUntil: "domcontentloaded" });

  await page.getByPlaceholder(/email/i).fill(email as string);
  await page.getByPlaceholder(/password/i).fill(password as string);
  await page.getByRole("button", { name: /sign in|login/i }).click();

  await page.goto("/billing?plan=pro", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /proceed to razorpay/i }).click();

  await page.waitForTimeout(2500);
  await expect(page.locator("body")).not.toContainText(/payment init failed/i);
  await expect(page.locator("body")).not.toContainText(/unauthorized/i);
});
