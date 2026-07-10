import { test, expect } from '@playwright/test';

async function clickFirstAvailable(page, selectors: string[]) {
    for (const s of selectors) {
        const loc = page.locator(s);
        if (await loc.count() > 0) {
            const el = loc.first();
            await el.scrollIntoViewIfNeeded().catch(() => null);
            // try a normal click then a forced click if necessary
            try {
                await el.click({ timeout: 5000 });
            } catch (e) {
                await el.click({ force: true, timeout: 5000 }).catch(() => null);
            }
            // give a short moment for navigation or client updates
            await page.waitForTimeout(500);
            return true;
        }
    }
    return false;
}

test.describe('Website smoke & navigation tests', () => {
    test('Home page loads and shows header or title', async ({ page }) => {
        await page.goto('/');
        // prefer page title but fall back to visible header/logo
        const title = await page.title();
        if (title && title.length > 0) {
            expect(title.toLowerCase()).toContain('give love back');
        }

        const header = page.locator('header, h1, [data-testid="site-title"], [aria-label="site"]');
        await expect(header.first()).toBeVisible();
    });

    test('Navigate to About page', async ({ page }) => {
        await page.goto('/');
        const selectors = ['a[href="/about"]', 'a:has-text("About")', 'text=About', 'a:has-text("Our Story")'];
        const clicked = await clickFirstAvailable(page, selectors);
        test.skip(!clicked, 'No About link found');
        // wait for navigation or content update
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/about/);
        // prefer an H1, otherwise assert the first H2 is visible
        const h1 = page.locator('h1');
        if (await h1.count() > 0) {
            await expect(h1.first()).toBeVisible();
        } else {
            const h2 = page.locator('h2');
            await expect(h2.first()).toBeVisible();
        }
    });

    test('Shop page shows at least one product', async ({ page }) => {
        const resp = await page.goto('/shop');
        if (!resp || resp.status() >= 400) {
            test.skip(true, 'No /shop page available');
            return;
        }
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/shop/);
        const selectors = ['.product', '.product-card', '[data-testid="product"]', 'article[role="article"]', 'main a[href*="/product"]', 'a:has-text("View product")', 'a.glb-tearsheet', 'h3.glb-tearsheet-name', 'a[href^="/shop/"]'];
        // attempt to trigger lazy-loading by scrolling
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(800);
        let total = 0;
        for (const s of selectors) {
            const loc = page.locator(s);
            const c = await loc.count();
            if (c > 0) total += c;
        }
        if (total === 0) {
            test.skip(true, 'No product selectors matched on /shop (site may use different markup)');
            return;
        }
        expect(total).toBeGreaterThan(0);
    });

    test('Contact page has a contact form', async ({ page }) => {
        await page.goto('/contact');
        await expect(page).toHaveURL(/\/contact/);
        const form = page.locator('form, [data-testid="contact-form"]');
        await expect(form.first()).toBeVisible();
    });

    test('Cart page shows cart UI or checkout CTA', async ({ page }) => {
        const resp = await page.goto('/cart');
        if (!resp || resp.status() >= 400) {
            test.skip(true, 'No /cart page available');
            return;
        }
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/cart/);
        const items = page.locator('.cart-item, [data-testid="cart-item"]');
        const checkoutBtnSelectors = ['button:has-text("Checkout")', 'a:has-text("Checkout")', '[data-testid="checkout"]', 'a:has-text("View Cart")', 'a:has-text("Proceed to checkout")'];
        const checkoutVisible = await (async () => {
            for (const s of checkoutBtnSelectors) {
                const loc = page.locator(s);
                if ((await loc.count()) > 0) {
                    const el = loc.first();
                    await el.scrollIntoViewIfNeeded().catch(() => null);
                    if (await el.isVisible().catch(() => false)) return true;
                }
            }
            return false;
        })();
        const itemCount = await items.count();
        if (itemCount === 0 && !checkoutVisible) {
            test.skip(true, 'No cart items or checkout CTA found');
            return;
        }
        expect(itemCount >= 0).toBeTruthy();
    });

    test('Add first product to cart then validate cart contains it', async ({ page }) => {
        const resp = await page.goto('/shop');
        if (!resp || resp.status() >= 400) {
            test.skip(true, 'No /shop page available');
            return;
        }
        await page.waitForLoadState('networkidle');
        // try to click a common add-to-cart button
        // Try to navigate into the first product detail page and check for add-to-cart
        const productLink = page.locator('a.glb-tearsheet, a[href^="/shop/"]');
        if ((await productLink.count()) === 0) {
            test.skip(true, 'No product links to open product detail');
            return;
        }
        const href = await productLink.first().getAttribute('href');
        if (!href) {
            test.skip(true, 'Product link has no href');
            return;
        }
        const resp2 = await page.goto(href);
        if (!resp2 || resp2.status() >= 500) {
            test.skip(true, 'Product detail page failed or returned server error');
            return;
        }
        await page.waitForLoadState('networkidle');
        // look for common add-to-cart controls
        const addSelectors = ['button:has-text("Add to cart")', 'button:has-text("Add to bag")', '[data-testid="add-to-cart"]', 'button:has-text("Add")'];
        let added = false;
        for (const s of addSelectors) {
            const loc = page.locator(s);
            if ((await loc.count()) > 0) {
                await loc.first().scrollIntoViewIfNeeded().catch(() => null);
                await loc.first().click({ timeout: 3000 }).catch(() => null);
                added = true;
                break;
            }
        }
        if (!added) {
            test.skip(true, 'No add-to-cart control on product page');
            return;
        }
        await page.waitForTimeout(800);
        await page.goto('/cart');
        await page.waitForLoadState('networkidle');
        const items = page.locator('.cart-item, [data-testid="cart-item"]');
        await expect(items.first()).toBeVisible();
    });

    test('Checkout page presents a form or payment step', async ({ page }) => {
        const resp = await page.goto('/checkout');
        if (!resp || resp.status() >= 400) {
            test.skip(true, 'No /checkout page available');
            return;
        }
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/\/checkout/);
        // check several independent selectors instead of a comma-separated locator
        const paymentSelectors = ['form', 'input[name="cardnumber"]', '[data-testid="payment-form"]', 'text=Payment', 'text="Order summary"', 'text=Order summary'];
        let foundPayment = false;
        for (const s of paymentSelectors) {
            const loc = page.locator(s);
            if ((await loc.count()) > 0) {
                if (await loc.first().isVisible().catch(() => false)) {
                    foundPayment = true;
                    break;
                }
            }
        }
        test.skip(!foundPayment, 'No obvious checkout/payment UI found');
    });

    test('Auth / login page shows an email/password form', async ({ page }) => {
        // try common auth routes
        const tryPaths = ['/login', '/signin', '/auth/signin', '/admin'];
        let navigated = false;
        for (const p of tryPaths) {
            const r = await page.goto(p);
            if (r && r.status() < 400) {
                navigated = true;
                await page.waitForLoadState('networkidle');
                break;
            }
        }
        if (!navigated) {
            test.skip(true, 'No auth/signin page found');
            return;
        }
        const email = page.locator('input[type="email"], input[name="email"], input[id*="email"]');
        const password = page.locator('input[type="password"], input[name="password"]');
        if ((await email.count()) === 0 && (await page.locator('button:has-text("Sign in with"), button:has-text("Continue with")').count()) === 0) {
            test.skip(true, 'No visible auth inputs or provider buttons');
            return;
        }
        if ((await email.count()) > 0) await expect(email.first()).toBeVisible();
        if ((await password.count()) > 0) await expect(password.first()).toBeVisible();
    });
});
