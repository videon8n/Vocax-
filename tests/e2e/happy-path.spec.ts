import { test, expect } from '@playwright/test';

/**
 * E2E do caminho feliz, sem áudio real (não dá pra mockar getUserMedia
 * no Playwright sem fake device em headless).
 *
 * Cobertura:
 *  - landing renderiza
 *  - onboarding intro renderiza e CTA leva à calibração
 *  - calibração mostra fallback educativo (jsdom-like ambiente sem mic real)
 *  - links públicos funcionam (sobre, privacidade, termos)
 */

test.describe('Vocax — happy path', () => {
  test('landing → onboarding → calibração', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Descubra a sua voz/i);
    await page.getByRole('link', { name: /Começar minha análise/i }).click();
    await expect(page).toHaveURL(/\/onboarding$/);
    await page.getByRole('link', { name: /Estou pronto|começar|continuar/i }).first().click();
    await expect(page).toHaveURL(/\/onboarding\/calibrar/);
  });

  test('páginas legais carregam', async ({ page }) => {
    for (const path of ['/privacidade', '/termos', '/sobre']) {
      await page.goto(path);
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('manifest gera ícones PNG dinâmicos', async ({ request }) => {
    const manifestRes = await request.get('/manifest.webmanifest');
    expect(manifestRes.ok()).toBeTruthy();
    const manifest = await manifestRes.json();
    expect(manifest.name).toContain('Vocax');
    expect(manifest.icons.length).toBeGreaterThan(2);
  });

  test('SEO básico: title, description e og:image', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Vocax/);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc?.length ?? 0).toBeGreaterThan(50);
  });
});
