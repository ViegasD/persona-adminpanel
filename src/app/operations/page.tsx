import {PageHeader,ErrorState} from '@/components/operations-ui';
import {ProviderSettings} from '@/components/provider-settings';
import {storefrontSettingsRequest} from '@/lib/storefront-settings-api';
import type {Operations} from '@/lib/operations-types';
export const dynamic='force-dynamic';
export default async function OperationsPage(){
 const data=await storefrontSettingsRequest<Operations>('operations').catch(()=>null);
 return <><PageHeader eyebrow="Operação e capacidade" title="Créditos das APIs" description="Acompanhe o saldo dos provedores e avise a equipe antes de interromper a produção."/>{data?<ProviderSettings initial={data}/>:<ErrorState/>}</>;
}
