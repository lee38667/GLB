import { test, expect } from '@playwright/test';

test('hello smoke', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    if (title && title.length > 0) {
        expect(title.length).toBeGreaterThan(0);
    } else {
        const header = page.locator('header, h1, [data-testid="site-title"], [aria-label="site"]');
        await expect(header.first()).toBeVisible();
    }
});