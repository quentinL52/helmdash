import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('text=Helmdash').first()).toBeVisible();
  });

  test('should have pricing section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#pricing')).toBeVisible();
  });
});

test.describe('Authentication', () => {
  test('should redirect to login when accessing protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/auth|\/login/);
    expect(page.url()).toMatch(/auth|login/);
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
  });
});

test.describe('Public Pages', () => {
  test('should display legal pages', async ({ page }) => {
    await page.goto('/legal/privacy');
    await expect(page.locator('h1')).toBeVisible();

    await page.goto('/legal/terms');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display notify page', async ({ page }) => {
    await page.goto('/notify');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});