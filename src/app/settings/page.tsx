import { fetchSettings } from '@/lib/settings-api';
import { SettingsForm } from './settings-form';
import { fetchStorefrontSettings } from '@/lib/storefront-settings-api';
import { StorefrontSettingsForm } from './storefront-settings-form';

export default async function SettingsPage() {
  const storefront = await fetchStorefrontSettings().catch(() => null);
  const settings = await fetchSettings().catch(() => null);

  return (
    <div className="max-w-4xl space-y-10">
      {storefront ? <StorefrontSettingsForm initialSettings={storefront.settings} initialPlans={storefront.plans} />
        : <section><h2 className="text-xl font-semibold">Configuracoes da loja</h2><p role="alert">Loja indisponivel. Verifique a conexao com o backend.</p></section>}
      <details className="border-t border-[var(--border)] pt-6">
      <summary className="font-semibold cursor-pointer">Configuracoes do atendimento legado</summary>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Configurações</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Ajustes do comportamento do bot em tempo real.
        </p>
      </div>
      <div className="max-w-xl">
        {settings ? <SettingsForm initialSettings={settings} /> : <p>Atendimento legado indisponivel.</p>}
      </div>
      </details>
    </div>
  );
}
