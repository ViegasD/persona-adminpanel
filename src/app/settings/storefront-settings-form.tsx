'use client';
import { useState } from 'react';
import type { StorefrontSettings, StorefrontPlan, StorefrontPolicy } from '@/lib/storefront-settings-types';

const field = 'w-full min-w-0 px-3 py-2 rounded border border-[var(--border)] bg-[var(--background)]';
const command = 'px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50';
const labels: Record<Exclude<keyof StorefrontPolicy, 'revision'>, string> = {
  new_orders_enabled: 'Aceitar novos pedidos', registration_enabled: 'Permitir cadastro de contas',
  credit_redemption_enabled: 'Permitir pagamento com saldo de creditos', require_account_checkout: 'Exigir conta no checkout',
};

export function StorefrontSettingsForm({ initialSettings, initialPlans }: { initialSettings: StorefrontSettings; initialPlans: StorefrontPlan[] }) {
  const [policy, setPolicy] = useState(initialSettings.policy);
  const [plans, setPlans] = useState(initialPlans);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const status = initialSettings.status;
  async function save(kind: 'policy' | 'plan', id?: number) {
    if (busy) return;
    setBusy(true); setMessage('');
    try {
      const plan = plans.find(p => p.id === id);
      const values = kind === 'policy' ? policy : plan && {
        price_cents: plan.price_cents, video_count: plan.video_count,
        max_characters_per_video: plan.max_characters_per_video, is_active: plan.is_active, features: plan.features,
      };
      const response = await fetch('/manager/api/storefront-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, id, values }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erro ao salvar.');
      if (kind === 'policy') setPolicy(result);
      setMessage('Configuracoes salvas.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Erro ao salvar.'); }
    finally { setBusy(false); }
  }
  function changePlan(id: number, patch: Partial<StorefrontPlan>) { setPlans(current => current.map(p => p.id === id ? { ...p, ...patch } : p)); }
  return <section className="space-y-6 min-w-0">
    <h2 className="text-xl font-semibold">Loja, contas e creditos</h2>
    <dl className="grid sm:grid-cols-2 gap-3 border-y border-[var(--border)] py-4 text-sm">
      <div><dt>Geracao de videos</dt><dd>{status.processing_enabled ? 'Habilitada no servidor' : 'Pausada no servidor'}</dd></div>
      <div><dt>Confirmacao de e-mail</dt><dd>{status.account_email_enabled ? 'Configurada' : 'Nao configurada'}</dd></div>
      <div><dt>Pedidos elegiveis a partir de</dt><dd>{status.processing_start_at ? new Date(status.processing_start_at).toLocaleString('pt-BR', { timeZone: 'America/Araguaina' }) : 'Sem janela autorizada'}</dd></div>
      <div><dt>Recuperacao automatica</dt><dd>{status.recovery_enabled ? 'Habilitada no servidor' : 'Desabilitada'}</dd></div>
      <div><dt>Creditos gratuitos e bonus</dt><dd>Proibidos</dd></div>
      <div><dt>Compra avulsa de creditos</dt><dd>Nao disponivel</dd></div>
      <div><dt>Custo por video</dt><dd>1 credito</dd></div>
    </dl>
    {!status.processing_enabled && <p role="status" className="text-amber-700">Novos pagamentos dependem da liberacao do worker no servidor. A pausa e a janela historica nao podem ser alteradas aqui.</p>}
    <fieldset disabled={busy} className="space-y-3">
      {Object.entries(labels).map(([key, label]) => <label key={key} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={policy[key as keyof typeof labels]} onChange={e => setPolicy(current => ({ ...current, [key]: e.target.checked }))} />{label}</label>)}
      <button type="button" className={command} onClick={() => save('policy')}>Salvar regras da loja</button>
    </fieldset>
    <p role="status" aria-live="polite">{message}</p>
    <h3 className="font-semibold">Pacotes</h3>
    <div className="divide-y divide-[var(--border)]">{plans.map(plan => <form key={plan.id} className="py-5 space-y-3" onSubmit={e => { e.preventDefault(); save('plan', plan.id); }}>
      <fieldset disabled={busy} className="space-y-3">
        <legend className="font-semibold">{plan.name}</legend>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={plan.is_active} onChange={e => changePlan(plan.id, { is_active: e.target.checked })} />Disponivel para novas compras</label>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <label>Preco (centavos)<input className={field} type="number" min="1" step="1" required value={plan.price_cents} onChange={e => changePlan(plan.id, { price_cents: Number(e.target.value) })} /></label>
          <label>Videos<input className={field} type="number" min="1" max="20" step="1" required value={plan.video_count} onChange={e => changePlan(plan.id, { video_count: Number(e.target.value) })} /></label>
          <label>Personagens por video<input className={field} type="number" min="1" max="4" step="1" required value={plan.max_characters_per_video} onChange={e => changePlan(plan.id, { max_characters_per_video: Number(e.target.value) })} /></label>
        </div>
        <label className="block text-sm">Itens do pacote<textarea className={field} rows={4} value={(plan.features || []).join('\n')} onChange={e => changePlan(plan.id, { features: e.target.value.split('\n') })} /></label>
        <button className={command} type="submit">Salvar pacote</button>
      </fieldset>
    </form>)}</div>
  </section>;
}
