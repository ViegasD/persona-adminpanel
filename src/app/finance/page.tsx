import Link from 'next/link';
import {fetchFinance} from '@/lib/finance-api';
import {PageHeader,Stat,money,usd,ErrorState,Empty} from '@/components/operations-ui';
import {FinanceOrderTable} from '@/components/finance-order-table';
import {ReportFilters} from '@/components/report-filters';
import {ReportPagination} from '@/components/report-pagination';
export const dynamic='force-dynamic';
export default async function Finance({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
 const params=await searchParams;const page=Math.max(1,Math.floor(Number(params.page)||1));
 const report=await fetchFinance({...params,limit:50,offset:(page-1)*50}).catch(()=>null);
 if(!report)return <ErrorState/>;const s=report.summary;
 const exportParams=new URLSearchParams();for(const[k,v]of Object.entries(params))if(v&&k!=='page')exportParams.set(k,v);
 return <><PageHeader eyebrow="Resultados e custos" title="Financeiro" description="Receita recebida, taxas e custos de geração, com detalhamento por vídeo."><Link className="button secondary" href="/settings#finance">Configurar cálculo</Link><a className="button" href={`/manager/api/finance-export?${exportParams}`}>Exportar CSV ↓</a></PageHeader>
  <dl className="metric-strip"><Stat label="Receita após reembolsos" value={money(s.net_revenue_cents)} note={`${money(s.refunded_cents)} reembolsados`}/><Stat label="Taxas de pagamento" value={money(s.fee_cents)} note={s.fee_cents==null?'Conciliação ou estimativa pendente':'Taxas conciliadas, informadas ou estimadas'}/><Stat label="Geração registrada" value={money(s.cost_brl_cents)} note={`${usd(s.cost_micro_usd)} · ${report.settings.usd_brl?`câmbio R$ ${report.settings.usd_brl}`:'configure USD/BRL'}`}/><Stat label="Margem de contribuição" value={money(s.contribution_cents)} note={`${s.calculated_orders}/${s.paid_orders} pedidos com cálculo completo`} tone={s.contribution_cents!=null&&s.contribution_cents<0?'negative':'accent'}/></dl>
  {(report.settings.usd_brl==null||s.calculated_orders<s.paid_orders)&&<div className="notice"><strong>Dados incompletos não viram lucro fictício.</strong> Configure o câmbio e os preços de IA; concilie as taxas em cada pedido. Pedidos sem registros suficientes não entram na margem calculada. <Link className="text-link" href="/settings#finance">Revisar configuração →</Link></div>}
  <ReportFilters action="/manager/finance" params={params} finance/>
  {report.truncated&&<p className="notice">Refine o período: os totais estão limitados aos primeiros 5.000 pedidos encontrados.</p>}
  <section className="panel"><div className="panel-header"><div><h2>Resultado por pedido</h2><p>Abra um pedido para ver receita rateada, tentativas e margem de cada vídeo.</p></div><span className="form-help">{report.total} pedidos</span></div>{report.items.length?<FinanceOrderTable items={report.items} financial/>:<Empty title="Sem movimentos neste filtro" description="Ajuste o período ou remova os filtros para consultar os pedidos."/>}</section>
  <ReportPagination base="/finance" params={params} total={report.total} page={page}/>
  <section className="panel section-gap"><div className="panel-header"><h2>Como ler estes resultados</h2></div><div className="panel-body form-help">Receita confirmada − reembolsos − taxas − comissão estimada − geração convertida em BRL − rateio e ajustes informados = margem de contribuição. A receita e as taxas do pacote são divididas entre os vídeos; custos de todas as tentativas ficam no vídeo que os gerou. O câmbio e preços de modelos são os configurados para este relatório. Isso não substitui o lucro líquido contábil: impostos e despesas fixas não informadas ficam de fora. Registros antigos podem não incluir roteiro e revisão de cenas.{s.unassigned_cost_records>0&&<p className="section-gap">Há {s.unassigned_cost_records} registros de IA sem vídeo associado. Eles não foram distribuídos artificialmente entre os pedidos.</p>}</div></section>
 </>;
}
