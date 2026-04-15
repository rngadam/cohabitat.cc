import { test, expect } from '@playwright/test';

test.describe('Header and Footer Components', () => {
  test('should load header and footer on index page', async ({ page }) => {
    await page.goto('/');

    // Wait for header and footer to load
    await page.waitForSelector('#navbar');
    await page.waitForSelector('footer');

    // Check header is loaded
    await expect(page.locator('#navbar')).toBeVisible();
    await expect(page.locator('a[href="index.html"]')).toContainText('Cohabitat.cc');

    // Check footer is loaded
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer')).toContainText('© 2026 Cohabitat.cc');
    await expect(page.locator('footer a[href*="coderbunker.ca"]')).toBeVisible();
  });

  test('should load header and footer on architecture page', async ({ page }) => {
    await page.goto('/architecture.html');

    // Wait for header and footer to load
    await page.waitForSelector('#navbar');
    await page.waitForSelector('footer');

    // Check header is loaded
    await expect(page.locator('#navbar')).toBeVisible();

    // Check active link for architecture
    await expect(page.locator('a[href="architecture.html"]')).toHaveClass(/text-accent/);

    // Check footer is loaded
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer')).toContainText('© 2026 Cohabitat.cc');
  });

  test('should load header and footer on organisation page', async ({ page }) => {
    await page.goto('/organisation.html');

    // Wait for header and footer to load
    await page.waitForSelector('#navbar');
    await page.waitForSelector('footer');

    // Check header is loaded
    await expect(page.locator('#navbar')).toBeVisible();

    // Check active link for organisation
    await expect(page.locator('a[href="organisation.html"]')).toHaveClass(/text-accent/);

    // Check footer is loaded
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer')).toContainText('© 2026 Cohabitat.cc');
  });

  test('should load header and footer on bim page', async ({ page }) => {
    await page.goto('/bim.html');

    // Wait for header and footer to load
    await page.waitForSelector('#navbar');
    await page.waitForSelector('footer');

    // Check header is loaded
    await expect(page.locator('#navbar')).toBeVisible();

    // Check footer is loaded
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('footer')).toContainText('© 2026 Cohabitat.cc');
  });
});

test.describe('Navigation Links', () => {
  test('logo should link to index page', async ({ page }) => {
    await page.goto('/architecture.html');
    await page.waitForSelector('#navbar');

    const logoLink = page.locator('a[href="index.html"]').first();
    await expect(logoLink).toBeVisible();

    await logoLink.click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('menu links should navigate to correct sections', async ({ page }) => {
    await page.goto('/architecture.html');
    await page.waitForSelector('#navbar');

    // Click on "Philosophie CC" link
    await page.locator('a[href="index.html#philosophie"]').click();
    await expect(page).toHaveURL(/index\.html#philosophie$/);

    // Should be on index page with hash
    await expect(page.locator('#philosophie')).toBeVisible();
  });

  test('page links should navigate to correct pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#navbar');

    // Click on Plan link
    await page.locator('a[href="architecture.html"]').click();
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
    await page.waitForSelector('footer');

    const footer = page.locator('footer');
    await expect(footer).toContainText('© 2026 Cohabitat.cc. Cohabitat.cc par Ricky Ng-Adam (Coderbunker Canada) est marqué CC0 1.0');

    // Check Coderbunker link
    const coderbunkerLink = footer.locator('a[href*="coderbunker.ca"]');
    await expect(coderbunkerLink).toBeVisible();
    await expect(coderbunkerLink).toHaveAttribute('href', 'https://coderbunker.ca/fr/');
  });

  test('should have social media links', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('footer');

    const footer = page.locator('footer');
    await expect(footer.locator('a[href*="facebook.com"]')).toBeVisible();
    await expect(footer.locator('a[href*="linkedin.com"]')).toBeVisible();
  });
});