import { expect, test, type Page } from '@playwright/test';

function collectPageProblems(page: Page) {
  const errors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  return errors;
}

async function expectNoPageProblems(errors: string[]) {
  expect(errors, errors.join('\n')).toEqual([]);
}

test.describe('homepage', () => {
  test('renders search UI without browser errors', async ({ page }) => {
    const errors = collectPageProblems(page);

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveTitle(/coffee search/i);
    await expect(page.getByRole('heading', { name: /describe your perfect coffee/i })).toBeVisible();
    await expect(page.getByPlaceholder(/in your own words/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /find my coffee/i })).toBeVisible();

    await expectNoPageProblems(errors);
  });

  test('supports keyboard navigation through the primary controls', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mobile browsers do not expose hardware Tab focus consistently.');

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('body').focus();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /skip to content/i })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /new search/i })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /coffee\s+search/i })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /view project on github/i })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByPlaceholder(/in your own words/i)).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /find my coffee/i })).toBeFocused();
  });

  test('announces search validation errors', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: /find my coffee/i }).click();

    await expect(page.locator('p[role="alert"]')).toContainText('Too short!');
  });

  test('supports search to product navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.getByPlaceholder(/in your own words/i).fill('your very best coffee');
    await page.getByRole('button', { name: /find my coffee/i }).click();

    await expect(page.getByRole('heading', { name: /our recommendations/i })).toBeVisible();
    const firstProductLink = page.getByRole('link', { name: /view product/i }).first();

    await expect(firstProductLink).toHaveAttribute('href', /\/product\/100001/);
    await firstProductLink.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL(/\/product\/100001/, { timeout: 10_000 }),
      firstProductLink.click(),
    ]);
    await expect(page.getByRole('heading', { level: 1, name: /golden lagoon/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /back to results/i })).toBeVisible();
  });
});

test.describe('product page', () => {
  test('renders product content without browser errors', async ({ page }) => {
    const errors = collectPageProblems(page);

    await page.goto('/product/100001', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const productImage = page.locator('section.product img.product__image:visible');
    await expect(productImage).toHaveCount(1);
    await expect(productImage).toHaveAttribute('alt', /pack shot of .* product/i);
    await expect(page.getByRole('link', { name: /back to results/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /buy now/i })).toBeVisible();

    await expectNoPageProblems(errors);
  });

  test('has a stable mobile layout for the key product actions', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/product/100001', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /buy now/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /back to results/i })).toBeVisible();
  });
});
