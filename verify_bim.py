from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:8080/bim.html")

    # Wait for the stack to be visible
    page.wait_for_selector("#building-stack")

    # Take initial screenshot
    page.screenshot(path="verification_initial.png")

    # Interact with slider (Zoom/Explode)
    page.fill("#explodeSlider", "1.5")
    # Trigger input event
    page.evaluate("document.getElementById('explodeSlider').dispatchEvent(new Event('input', { bubbles: true }))")
    page.wait_for_timeout(500) # Wait for transition
    page.screenshot(path="verification_exploded.png")

    # Toggle Engineering View
    page.click("button:has-text('Vue Ingénierie')")
    page.wait_for_timeout(500) # Wait for transition
    page.screenshot(path="verification_engineering.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
