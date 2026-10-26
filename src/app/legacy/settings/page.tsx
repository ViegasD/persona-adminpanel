import Link from 'next/link';
import {fetchSettings} from '@/lib/settings-api';
import {SettingsForm} from '@/app/settings/settings-form';
import {PageHeader,Empty} from '@/components/operations-ui';
export default async function LegacySettings(){const settings=await fetchSettings().catch(()=>null);return <><PageHeader eyebrow="Ferramentas legadas" title="Configurações do bot" description="Estas configurações pertencem ao atendimento antigo. As regras da loja atual ficam em Configurações."/><Link className="text-link" href="/legacy">← Voltar ao legado</Link><div className="section-gap">{settings?<SettingsForm initialSettings={settings}/>:<Empty title="Atendimento antigo indisponível" description="A operação da loja atual não depende desta conexão."/>}</div></>;}
