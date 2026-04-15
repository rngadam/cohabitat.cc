import { test, expect } from '@playwright/test';

test.describe('Header and Footer Components', () => {
  test('should load header and footer on index page', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#navbar')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer')).toContainText('© 2026 Cohabitat.cc');
  });

  test('should load header and footer on architecture page', async ({ page }) => {
    await page.goto('/architecture.html');
    await expect(page.locator('#navbar')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Check active link for architecture
    await expect(page.locator('#navbar a[href="architecture.html"]').first()).toHaveClass(/text-accent/);

    // Check footer is loaded
    await expect(page.locator('footer')).toContainText('© 2026 Cohabitat.cc');
  });

  test('should load header and footer on organisation page', async ({ page }) => {
    await page.goto('/organisation.html');
    await expect(page.locator('#navbar')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Check active link for organisation
    await expect(page.locator('#navbar a[href="organisation.html"]').first()).toHaveClass(/text-accent/);

    // Check footer is loaded
    await expect(page.locator('footer')).toContainText('© 2026 Cohabitat.cc');
  });

  test('should load header and footer on bim page', async ({ page }) => {
    await page.goto('/bim.html');
    await expect(page.locator('#navbar')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Check footer is loaded
    await expect(page.locator('footer')).toContainText('© 2026 Cohabitat.cc');
  });
});

test.describe('Navigation Links', () => {
  test('logo should link to index page', async ({ page }) => {
    await page.goto('/architecture.html');
    await page.waitForSelector('#navbar');

    // Logo link is usually the first index.html link
    const logoLink = page.locator('#navbar a[href="index.html"]').first();
    await expect(logoLink).toBeVisible();

    await logoLink.click();
    await expect(page).toHaveURL(/\/index\.html$|\/$/);
  });

  test('menu links should navigate to correct sections', async ({ page }) => {
    await page.goto('/architecture.html');
    await page.waitForSelector('#navbar');

    // Click the menu button (now unified)
    const menuButton = page.locator('#navbar button[onclick*="toggleMobileMenu"]').filter({ visible: true });
    await menuButton.click();
    await expect(page.locator('#mobile-menu')).toBeVisible();

    await page.locator('#mobile-menu a[href="index.html#philosophie"]').click();

    await expect(page).toHaveURL(/index\.html#philosophie$/);
    await expect(page.locator('#philosophie')).toBeVisible();
  });

  test('page links should navigate to correct pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#navbar');

    const menuButton = page.locator('#navbar button[onclick*="toggleMobileMenu"]').filter({ visible: true });
    await menuButton.click();
    await expect(page.locator('#mobile-menu')).toBeVisible();

    await page.locator('#mobile-menu a[href="architecture.html"]').click();

    await expect(page).toHaveURL(/architecture\.html$/);
  });

  test('mobile menu should work', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile size

    await page.goto('/');
    await page.waitForSelector('#navbar');

    // Open mobile menu
    await page.locator('button[onclick*="toggleMobileMenu"]').click();
    await expect(page.locator('#mobile-menu')).toBeVisible();

    // Click a link
    await page.locator('#mobile-menu a[href="architecture.html"]').click();
    await expect(page).toHaveURL(/architecture\.html$/);
  });
});

test.describe('Footer Content', () => {
  test('should display correct copyright notice', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('footer');
    await expect(footer).toContainText('© 2026 Cohabitat.cc');

    // Check CC0 link
    const ccLink = footer.locator('a[href*="creativecommons.org"]');
    await expect(ccLink).toBeVisible();

    // Check Coderbunker link
    const coderbunkerLink = footer.locator('a[href*="coderbunker.ca"]');
    await expect(coderbunkerLink).toBeVisible();
  });

  test('should have social media links', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('footer');

    const footer = page.locator('footer');
    await expect(footer.locator('a[href*="facebook.com"]')).toBeVisible();
    await expect(footer.locator('a[href*="linkedin.com"]')).toBeVisible();
  });
});