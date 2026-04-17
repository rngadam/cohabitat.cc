import { test, expect } from '@playwright/test';

test.describe('Simulator V2 - Unified Experience', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/plan.html');
    // Wait for data to load
    await page.waitForFunction(() => window.costCalculator !== null);
  });

  test('Desktop: Results Peek should appear on scroll', async ({ page, isMobile }) => {
    test.skip(isMobile, 'This test is for desktop only');

    const resultsBar = page.locator('#floating-simulator');
    // Check initial opacity
    const initialOpacity = await resultsBar.evaluate(el => window.getComputedStyle(el).opacity);
    expect(parseFloat(initialOpacity)).toBe(0);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 100));

    // Check opacity and visibility
    await expect(resultsBar).toBeVisible();
    await page.waitForFunction(() => parseFloat(window.getComputedStyle(document.getElementById('floating-simulator')).opacity) > 0);
    const finalOpacity = await resultsBar.evaluate(el => window.getComputedStyle(el).opacity);
    expect(parseFloat(finalOpacity)).toBeGreaterThan(0);
  });

  test('Desktop: Settings panel should open and close', async ({ page, isMobile }) => {
    test.skip(isMobile, 'This test is for desktop only');

    await page.evaluate(() => window.scrollTo(0, 500));
    const resultsBar = page.locator('#floating-simulator');
    const settingsBtn = resultsBar.locator('button[onclick*="toggleSimulatorPanel"]');
    const panel = page.locator('#desktop-simulator-panel');

    // Open panel
    await settingsBtn.click();
    await expect(panel).toBeVisible();
    await expect(panel).not.toHaveClass(/translate-x-full/);

    // Close panel
    const closeBtn = panel.locator('button[onclick*="toggleSimulatorPanel(false)"]');
    await closeBtn.click();
    await expect(panel).toHaveClass(/translate-x-full/);
  });

  test('Calculations: Rent should update when Bond Rate changes', async ({ page, isMobile }) => {
    test.skip(isMobile, 'This test is for desktop only');

    await page.evaluate(() => window.scrollTo(0, 500));

    // Get initial rent
    const rentEl = page.locator('#float-net-rent');
    const initialRent = await rentEl.textContent();

    // Open panel
    await page.locator('#floating-simulator button[onclick*="toggleSimulatorPanel"]').click();

    // Adjust Bond Rate slider
    const rateSlider = page.locator('#panel-bond-rate-input');
    await rateSlider.fill('10'); // Set to 10%

    // Wait for recalculation with robust assertion
    await expect(rentEl).not.toHaveText(initialRent);

    const updatedRent = await rentEl.textContent();
    expect(updatedRent).not.toBe(initialRent);
  });

  test('Mobile: Bottom bar and drawer should work', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test is for mobile only');

    await page.evaluate(() => window.scrollTo(0, 100));

    const bottomBar = page.locator('#mobile-simulator-bar');
    await expect(bottomBar).toBeVisible();
    await expect(bottomBar).not.toHaveClass(/translate-y-full/);

    const drawer = page.locator('#mobile-simulator-drawer');
    const openDrawerBtn = bottomBar.locator('button[onclick*="toggleSimulatorPanel"]');

    // Open drawer
    await openDrawerBtn.click();
    await expect(drawer).toBeVisible();
    await expect(drawer).not.toHaveClass(/translate-y-full/);

    // Close drawer
    const closeDrawerBtn = drawer.locator('.drawer-handle');
    await closeDrawerBtn.click();
    await expect(drawer).toHaveClass(/translate-y-full/);
  });

  test('UI: Terminology and Summary Cards', async ({ page }) => {
    // Wait for the summary container to become visible (indicates data loaded and rendered)
    await expect(page.locator('#allocation-summary')).toBeVisible({ timeout: 10000 });

    // Check for the three main cards on desktop using the specific ID
    const cards = page.locator('#financial-summary-grid > div');

    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 1024) {
        await expect(cards).toHaveCount(4);
    }

    // Check terminology in cards
    await expect(page.locator('p:has-text("Apport par fondateur")')).toBeVisible();
    await expect(page.locator('p:has-text("Loyers Fondateurs (Par Suite)")')).toBeVisible();

    // Check for the amortization card specifically
    const amortHeader = page.locator('h4:has-text("Amortissement")');
    await expect(amortHeader).toBeVisible();

    // Check pre-dev table header - using a more specific search
    const preDevHeading = page.locator('h3:has-text("Détail de l\'Investissement Initial")');
    await expect(preDevHeading).toBeVisible();
  });

  test('Calculations: Mutualisation (Autogestion) should reduce OPEX', async ({ page }) => {
    // Open settings - handle mobile vs desktop
    await page.evaluate(() => window.scrollTo(0, 500));
    let settingsBtn;
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 1024) {
        settingsBtn = page.locator('#mobile-simulator-bar button');
    } else {
        settingsBtn = page.locator('#floating-simulator button');
    }
    await settingsBtn.click();

    // Get initial OPEX Total (Card 1)
    const opexSelector = 'div:has-text("OPEX Total (Détail ci-contre)") span:last-child';
    const initialOpexText = await page.locator(opexSelector).first().textContent();
    const initialOpex = parseFloat(initialOpexText.replace(/[^0-9,.-]/g, '').replace(',', '.'));

    // Toggle Mutualisation via the panel button
    const tasksBtn = (viewport && viewport.width < 1024) ? page.locator('#btn-mobile-tasks') : page.locator('#btn-panel-tasks');
    await tasksBtn.click();

    // Verify OPEX reduced - wait for visual change and badge
    await expect(page.locator('span:has-text("Mutualisation Active")')).toBeVisible();

    // Check for line-through on concierge salary in Detail card
    const conciergeValue = page.locator('span:has-text("Maintenance & Nettoyage") + span');
    await expect(conciergeValue).toHaveClass(/line-through/);

    // Verify numeric reduction in summary
    const opexLocator = page.locator('div:has-text("OPEX Total (Détail ci-contre)") span').last();
    const newText = await opexLocator.textContent();
    const newOpex = parseFloat(newText.replace(/[^0-9,.-]/g, '').replace(',', '.'));
    expect(newOpex).toBeLessThan(initialOpex);
  });

  test('Calculations: PME-MTL matching should split bond debt', async ({ page }) => {
    // Open settings - handle mobile vs desktop
    await page.evaluate(() => window.scrollTo(0, 500));
    let settingsBtn;
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 1024) {
        settingsBtn = page.locator('#mobile-simulator-bar button');
    } else {
        settingsBtn = page.locator('#floating-simulator button');
    }
    await settingsBtn.click();

    // Verify initial state
    const initialInvestmentSelector = 'p:has-text("Apport par fondateur") + div p.text-3xl';
    await expect(page.locator(initialInvestmentSelector)).toBeVisible();
    const initialInvestmentText = await page.locator(initialInvestmentSelector).textContent();
    const initialValue = parseFloat(initialInvestmentText.replace(/[^0-9,.-]/g, '').replace(',', '.'));

    // Toggle PME-MTL via the panel button
    const pmeBtn = (viewport && viewport.width < 1024) ? page.locator('#btn-mobile-pme-mtl') : page.locator('#btn-panel-pme-mtl');
    await pmeBtn.click();

    // Verify badge appears
    const badge = page.locator('span:has-text("Match PME-MTL Actif")');
    await expect(badge).toBeVisible();

    // Check investment reduced by approx 50%
    const newInvestmentText = await page.locator(initialInvestmentSelector).textContent();
    const newValue = parseFloat(newInvestmentText.replace(/[^0-9,.-]/g, '').replace(',', '.'));

    expect(newValue).toBeLessThan(initialValue * 0.6); // Accounting for mortgage dpm which isn't matched
    expect(newValue).toBeGreaterThan(initialValue * 0.4);
  });
});
