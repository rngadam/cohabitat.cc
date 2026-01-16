
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local index.html file
        page.goto(f"file://{os.path.abspath('index.html')}")

        # Take a screenshot of the "Sas d'entrée" section
        # We scroll to it first
        page.locator("text=Sas d'entrée").scroll_into_view_if_needed()
        page.screenshot(path="verification/index_sas.png")

        # Load the bim.html file
        page.goto(f"file://{os.path.abspath('bim.html')}")

        # Take a screenshot of the initial 3D view
        page.screenshot(path="verification/bim_initial.png")

        # Click on "1er Étage" to show details
        page.locator(".layer-coworking").click()
        page.wait_for_timeout(500) # Wait for animation/update
        page.screenshot(path="verification/bim_coworking.png")

        # Click on Engineering view
        page.click("text=Vue Ingénierie")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/bim_engineering.png")

        browser.close()

if __name__ == "__main__":
    run()
