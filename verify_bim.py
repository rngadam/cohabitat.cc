from playwright.sync_api import Page, expect, sync_playwright
import time
import os

# Create directory if not exists
os.makedirs("/home/jules/verification", exist_ok=True)

def verify_bim_visualization(page: Page):
    # 1. Arrange
    page.goto("http://localhost:8080/bim.html")
    page.wait_for_selector("#building-stack")

    # 2. Act: Explode the view
    slider = page.locator("#explode-slider")
    expect(slider).to_be_visible()

    # Set slider to 50
    # Playwright input range manipulation can be tricky, let's try fill or evaluate
    slider.fill("50")
    # Trigger input event just in case
    slider.dispatch_event("input")

    # Wait for transition
    time.sleep(1)

    # 3. Assert & Screenshot Exploded View
    # Check if elevator structure exists
    expect(page.locator(".structure-elevator").first).to_be_visible()

    page.screenshot(path="/home/jules/verification/bim_exploded.png")

    # 4. Act: Toggle Engineering View
    eng_btn = page.get_by_role("button", name="Vue Ingénierie")
    eng_btn.click()

    # Wait for toggle
    time.sleep(1)

    # 5. Assert & Screenshot Engineering View
    expect(page.locator(".building-stack.engineering")).to_be_visible()

    page.screenshot(path="/home/jules/verification/bim_engineering.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_bim_visualization(page)
            print("Verification script finished successfully.")
        except Exception as e:
            print(f"Verification script failed: {e}")
        finally:
            browser.close()
