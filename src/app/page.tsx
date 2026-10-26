import Link from 'next/link';
import {fetchFinance} from '@/lib/finance-api';
import {storefrontSettingsRequest} from '@/lib/storefront-settings-api';
import type {StorefrontSettings} from '@/lib/storefront-settings-types';
import {PageHeader,Stat,Status,money,usd,ErrorState} from '@/components/operations-ui';
import {FinanceOrderTable} from '@/components/finance-order-table';
export const dynamic='force-dynamic';
export default async function Overview(){
 const [report,runtime]=await Promise.all([fetchFinance({limit:6}).catch(()=>null),storefrontSettingsRequest<StorefrontSettings>('storefront-settings').catch(()=>null)]);
 if(!report)return <ErrorState/>;
 const s=report.summary;
 return <><PageHeader eyebrow="Operação da loja" title="Seu estúdio, em dia." description="Acompanhe o que entrou, o que foi entregue e o que precisa de atenção."><Link className="button" href="/orders">Ver todos os pedidos <span aria-hidden="true">↗</span></Link></PageHeader>
  <dl className="metric-strip"><Stat label="Receita confirmada" value={money(s.net_revenue_cents)} note="Pagamentos recebidos, menos reembolsos"/><Stat label="Pedidos entregues" value={String(s.delivered)} note={`${s.paid_orders} pedidos com pagamento registrado`}/><Stat label="Atenção necessária" value={String(s.attention)} note="Falhas ou pedidos pagos ainda não entregues" tone={s.attention?'negative':''}/><Stat label="Margem de contribuição" value={money(s.contribution_cents)} note={s.contribution_cents==null?`${s.calculated_orders}/${s.paid_orders} pedidos com dados suficientes`:'Após custos registrados e taxas'} tone="accent"/></dl>
  {report.settings.usd_brl==null&&<div className="notice">O financeiro precisa do câmbio USD/BRL e das taxas para calcular margens. <Link className="text-link" href="/settings#finance">Configurar custos e câmbio →</Link></div>}
  <div className="operational-grid"><section className="panel"><div className="panel-header"><div><h2>Fluxo de pedidos</h2><p>Do pagamento à entrega na conta do cliente.</p></div><Link className="text-link" href="/orders?attention=true">Ver pendências →</Link></div><div className="health-list">{['AWAITING_PAYMENT','PAID','GENERATING','DELIVERED','FAILED'].map(key=><div className="health-row" key={key}><Status value={key}/><strong>{s.statuses[key]||0}</strong></div>)}</div></section>
   <section className="panel"><div className="panel-header"><div><h2>Saúde da operação</h2><p>Configurações reais do servidor.</p></div><span className={`status-badge ${runtime?.status.processing_enabled?'status-ready':'status-failed'}`}>{runtime?.status.processing_enabled?'Ativa':'Verificar'}</span></div><div className="health-list"><div className="health-row"><span>Novas gerações</span><strong>{runtime?.status.processing_enabled?'Habilitadas':'Indisponíveis'}</strong></div><div className="health-row"><span>E-mail transacional</span><strong>{runtime?.status.account_email_enabled?'Configurado':'Não configurado'}</strong></div><div className="health-row"><span>Recuperação histórica</span><strong>{runtime?.status.recovery_enabled?'Habilitada':'Protegida'}</strong></div><div className="health-row"><span>Uso de IA registrado</span><strong>{usd(s.cost_micro_usd)}</strong></div><div className="health-row"><span>Testes fora dos relatórios</span><strong>{s.excluded_tests}</strong></div></div></section>
  </div>
  <section className="panel section-gap"><div className="panel-header"><div><h2>Pedidos recentes</h2><p>Abra um pedido para assistir aos vídeos e conferir seus custos.</p></div><Link className="text-link" href="/orders">Todos os pedidos →</Link></div><FinanceOrderTable items={report.items}/></section>
  <div className="section-gap form-help">Margem de contribuição não é lucro líquido: impostos e despesas fixas não rateadas ficam fora do cálculo. Custos históricos de IA podem ser estimados ou incompletos.</div>
 </>;
}
