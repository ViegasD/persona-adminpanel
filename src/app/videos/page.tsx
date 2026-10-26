import Link from 'next/link';
import {fetchFinance} from '@/lib/finance-api';
import {fetchOrderVideos} from '@/lib/storefront-api';
import {PageHeader,Status,Empty,ErrorState} from '@/components/operations-ui';
import {ReportFilters} from '@/components/report-filters';
import {ReportPagination} from '@/components/report-pagination';
export const dynamic='force-dynamic';
export default async function Videos({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
 const params=await searchParams;
 const filters={...params,status:params.status??'DELIVERED'};
 const page=Math.max(1,Math.floor(Number(params.page)||1));
 const offset=(page-1)*12;
 const report=await fetchFinance({...filters,limit:12,offset}).catch(()=>null);
 if(!report)return <ErrorState/>;
 const orders=await Promise.all(report.items.map(order=>fetchOrderVideos(order.order_id).catch(()=>null)));
 return <><PageHeader eyebrow="Biblioteca de produção" title="Vídeos" description="Assista às entregas e confira as cenas e mensagens em cada pedido."><Link className="button secondary" href="/approvals">Revisões pendentes →</Link></PageHeader>
  <ReportFilters action="/manager/videos" params={filters}/>
  {report.items.length===0?<Empty title="Nenhum vídeo neste filtro" description="Ajuste a busca ou o período para encontrar os pedidos."/>:<div className="video-grid">{orders.map((order,index)=>order?order.items.map(item=><article className="video-panel" key={item.item_id}>
   <div className="video-heading"><h2>Pedido #{order.order_id} · Vídeo {item.sequence}</h2><Status value={item.status}/></div>
   <div className="video-stage">{item.video_url?<video controls playsInline preload="none" poster={item.thumbnail_url||undefined} src={item.video_url} aria-label={`Vídeo ${item.sequence} do pedido ${order.order_id}`}/>:<div className="empty-state"><p>Vídeo ainda não disponível.</p></div>}</div>
   <div className="video-content"><strong>{item.recipient_name||order.recipient_name||'Sem destinatário'}</strong><p className="form-help">{item.character_ids.join(', ')}</p><Link className="text-link" href={`/orders/${order.order_id}`}>Ver pedido, cena e custos →</Link></div>
  </article>):<div className="notice error" key={report.items[index].order_id}>Não foi possível carregar o pedido #{report.items[index].order_id}. Atualize para tentar novamente.</div>)}</div>}
  <ReportPagination base="/videos" params={filters} total={report.total} page={page} size={12}/>
 </>;
}
