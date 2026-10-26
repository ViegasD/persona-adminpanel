import {fetchStorefrontSettings} from '@/lib/storefront-settings-api';
import {fetchFinanceSettings} from '@/lib/finance-api';
import {StorefrontSettingsForm} from './storefront-settings-form';
import {FinanceSettingsForm} from '@/components/finance-settings-form';
import {PageHeader,ErrorState} from '@/components/operations-ui';
export const dynamic='force-dynamic';
export default async function Settings(){
 const [storefront,finance]=await Promise.all([fetchStorefrontSettings().catch(()=>null),fetchFinanceSettings().catch(()=>null)]);
 return <><PageHeader eyebrow="Regras da operação" title="Configurações" description="Controle a loja, a geração e as premissas financeiras. As proteções de pedidos históricos permanecem no servidor."/><div className="settings-stack">
  {finance?<FinanceSettingsForm initial={finance} model={storefront?.settings.status.default_script_model||''}/>:<ErrorState/>}
  {storefront?<section className="panel"><div className="panel-body"><StorefrontSettingsForm initialSettings={storefront.settings} initialPlans={storefront.plans.filter(p=>p.slug!=='aniversario')}/></div></section>:<ErrorState/>}
 </div></>;
}
