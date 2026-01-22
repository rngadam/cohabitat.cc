
from playwright.sync_api import sync_playwright

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Verify index.html text change (Logistique/Fablab)
        page.goto("http://localhost:8080/index.html")
        page.wait_for_selector("#logistique")
        page.locator("#logistique").scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        page.screenshot(path="verification/index_fablab.png")

        # Verify Open Source Section
        # It's the section after logistique. We can find it by text.
        page.locator("text=L'Intelligence Collective Numérique").scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        page.screenshot(path="verification/index_opensource.png")

        # Verify Footer
        page.locator("footer").scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        page.screenshot(path="verification/index_footer.png")

        # Verify bim.html 3D elements
        page.goto("http://localhost:8080/bim.html")
        page.wait_for_selector("#building-stack")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/bim_view.png")

        # Verify Engineering Mode
        page.click("button:has-text('Vue Ingénierie')")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/bim_engineering.png")

        # Verify BIM Footer
        page.locator("footer").scroll_into_view_if_needed()
        page.wait_for_timeout(500)
        page.screenshot(path="verification/bim_footer.png")

        browser.close()

if __name__ == "__main__":
    verify_changes()
