import 'server-only';
import type { StorefrontPlan, StorefrontSettings } from './storefront-settings-types';

export async function storefrontSettingsRequest<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const base = process.env.STOREFRONT_API_URL;
  const key = process.env.STOREFRONT_ADMIN_KEY;
  if (!base || !key) throw new Error('Conexao com a loja nao configurada.');
  const response = await fetch(`${base.replace(/\/$/, '')}/api/v1/admin/${path}`, {
    method, cache: 'no-store', signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': key },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    if (response.status === 409) throw new Error('Configuracoes alteradas por outra sessao. Recarregue antes de salvar.');
    throw new Error('Nao foi possivel acessar as configuracoes da loja.');
  }
  return response.json();
}
export async function fetchStorefrontSettings() {
  const [settings, plans] = await Promise.all([
    storefrontSettingsRequest<StorefrontSettings>('storefront-settings'),
    storefrontSettingsRequest<StorefrontPlan[]>('plans'),
  ]);
  return { settings, plans };
}
