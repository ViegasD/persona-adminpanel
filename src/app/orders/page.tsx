import {fetchFinance} from '@/lib/finance-api';
import {PageHeader,Stat,money,ErrorState,Empty} from '@/components/operations-ui';
import {FinanceOrderTable} from '@/components/finance-order-table';
import {ReportFilters} from '@/components/report-filters';
import {ReportPagination} from '@/components/report-pagination';
export const dynamic='force-dynamic';
export default async function Orders({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
 const params=await searchParams;const page=Math.max(1,Math.floor(Number(params.page)||1));
 const report=await fetchFinance({...params,limit:50,offset:(page-1)*50}).catch(()=>null);
 if(!report)return <ErrorState/>;const s=report.summary;
 return <><PageHeader eyebrow="Acompanhar e revisar" title="Pedidos" description="Encontre clientes, assista aos vídeos e acompanhe cada entrega. Testes marcados ficam fora dos totais por padrão."/>
  <dl className="metric-strip"><Stat label="Pedidos encontrados" value={String(report.total)} note="Dentro dos filtros selecionados"/><Stat label="Receita confirmada" value={money(s.net_revenue_cents)} note="Após reembolsos"/><Stat label="Entregues" value={String(s.delivered)} note="Vídeos disponíveis para o cliente"/><Stat label="Precisam de atenção" value={String(s.attention)} note="Históricos permanecem protegidos" tone={s.attention?'negative':''}/></dl>
  <ReportFilters action="/manager/orders" params={params}/>
  {report.truncated&&<p className="notice">Mais de 5.000 pedidos no período. Refine os filtros para obter totais completos.</p>}
  {report.items.length?<section className="panel"><FinanceOrderTable items={report.items}/></section>:<Empty title="Nenhum pedido encontrado" description="Tente outro nome, e-mail ou período. Você também pode incluir pedidos marcados como teste."/>}
  <ReportPagination base="/orders" params={params} total={report.total} page={page}/>
 </>;
}
