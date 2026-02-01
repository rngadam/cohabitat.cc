from playwright.sync_api import sync_playwright

def verify_bim():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to BIM page
        page.goto("http://localhost:8080/bim.html")

        # Wait for stack
        page.wait_for_selector("#building-stack")

        # Take screenshot of default state
        page.screenshot(path="verification/bim_default.png", full_page=True)

        # Interact with slider
        slider = page.locator("#zoom-slider")
        slider.fill("2") # Set to max
        # Trigger input event if fill doesn't do it automatically (fill usually does input+change)
        # Actually for range input, fill might not work as expected in all browsers, but let's try.
        # Better: evaluate JS
        page.evaluate("document.getElementById('zoom-slider').value = 2; document.getElementById('zoom-slider').dispatchEvent(new Event('input'));")

        # Wait a bit for transition
        page.wait_for_timeout(1000)

        # Take screenshot of exploded state
        page.screenshot(path="verification/bim_exploded.png", full_page=True)

        # Toggle Engineering
        page.click("button:has-text('Vue Ingénierie')")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/bim_engineering.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    verify_bim()
