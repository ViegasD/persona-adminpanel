import Link from 'next/link';
import {notFound} from 'next/navigation';
import {fetchOrderVideos} from '@/lib/storefront-api';
import {fetchFinance} from '@/lib/finance-api';
import {PageHeader,Status,Stat,money,usd,dateTime,ErrorState} from '@/components/operations-ui';
import {OrderFinanceActions,RetryVideo} from '@/components/order-finance-actions';
export const dynamic='force-dynamic';
export default async function OrderDetail({params}:{params:Promise<{id:string}>}){
 const{id}=await params;if(!/^\d+$/.test(id)||!Number.isSafeInteger(Number(id))||Number(id)<1)notFound();
 const [order,report]=await Promise.all([fetchOrderVideos(Number(id)).catch(()=>null),fetchFinance({order_id:Number(id)}).catch(()=>null)]);
 if(!order)return <ErrorState/>;const financial=report?.items[0];
 return <><Link className="text-link" href="/orders">← Voltar aos pedidos</Link><div className="section-gap"><PageHeader eyebrow="Pedido e produção" title={`Pedido #${id}`} description={`${order.recipient_name||'Cliente'} · ${order.email||order.phone||'Sem contato informado'}`}><Status value={order.status}/>{financial?.is_test&&<span className="badge-test">Teste</span>}</PageHeader></div>
  {financial&&<dl className="metric-strip"><Stat label="Receita confirmada" value={money(financial.net_revenue_cents)} note={`${money(financial.refunded_cents)} reembolsados`}/><Stat label="Taxas de pagamento" value={money(financial.fee_cents)} note={financial.fee_cents==null?'Taxas ainda não conciliadas':financial.fee_source==='provider'?'Conciliadas com o provedor':financial.fee_source==='manual'?'Informadas no pedido':'Estimadas ou pendentes'}/><Stat label="Geração registrada" value={usd(financial.cost_micro_usd)} note={money(financial.cost_brl_cents)}/><Stat label="Margem de contribuição" value={money(financial.contribution_cents)} note={financial.contribution_cents==null?'Há dados pendentes':'Estimativa após custos registrados'} tone="accent"/></dl>}
  {financial&&!financial.processing_allowed&&<div className="notice info">Este pedido está fora da janela de processamento autorizada. Os vídeos existentes podem ser consultados; novas tentativas históricas permanecem bloqueadas.</div>}
  {!!financial?.missing.length&&<div className="notice"><strong>O cálculo ainda precisa de dados:</strong> {financial.missing.join(' · ')}. <Link className="text-link" href="/settings#finance">Configurar financeiro →</Link></div>}
  <div className="panel-header" style={{paddingLeft:0,paddingRight:0,border:0,marginBottom:10}}><div><h2>Vídeos e cenas</h2><p>Assista com áudio, avance ou abra em tela cheia. Atualize a página se um link expirar.</p></div><span className="form-help">{order.items.length} vídeo(s)</span></div>
  <div className="video-grid">{order.items.map(item=>{const f=financial?.items.find(i=>i.item_id===item.item_id);return <article key={item.item_id} className="video-panel"><div className="video-heading"><h2>Vídeo {item.sequence} <span className="muted">· #{item.item_id}</span></h2><Status value={item.status}/></div>
   <div className="video-stage">{item.video_url?<video controls playsInline preload="none" poster={item.thumbnail_url||undefined} aria-label={`Vídeo ${item.sequence} do pedido ${id}`} src={item.video_url}>Use o link abaixo para abrir o vídeo.</video>:<div className="empty-state"><p>Vídeo ainda não disponível.</p></div>}</div>
   <div className="video-content"><div><strong>{item.recipient_name||'Destinatário não informado'}</strong><p className="form-help">{item.recipient_age?`${item.recipient_age} anos · `:''}{item.character_ids.join(', ')}{item.occasion?` · ${item.occasion}`:''}</p></div>
    {item.video_url&&<a className="text-link" href={item.video_url} target="_blank" rel="noopener noreferrer">Abrir vídeo em outra aba ↗</a>}
    {item.scene_url&&<details><summary>Ver cena usada na geração</summary>{/* eslint-disable-next-line @next/next/no-img-element */}<img loading="lazy" src={item.scene_url} alt={`Cena aprovada para o vídeo ${item.sequence}`}/></details>}
    {item.message&&<details><summary>Ver mensagem do pedido</summary><p className="form-help" style={{whiteSpace:'pre-wrap',marginTop:10}}>{item.message}</p></details>}
    {f&&<dl className="video-finance"><div><dt>Receita rateada</dt><dd>{money(f.revenue_cents)}</dd></div><div><dt>IA · todas as tentativas</dt><dd>{usd(f.cost_micro_usd)}</dd></div><div><dt>Taxa + comissão</dt><dd>{f.fee_cents==null?'—':money(f.fee_cents+f.commission_cents)}</dd></div><div><dt>Margem estimada</dt><dd className={f.contribution_cents!=null&&f.contribution_cents<0?'negative':'positive'}>{money(f.contribution_cents)}</dd></div><div><dt>Tentativas de vídeo</dt><dd>{f.video_attempts}</dd></div><div><dt>Registros de IA</dt><dd>{f.cost_records}</dd></div></dl>}
    {item.error&&<p className="notice error">{item.error}</p>}
    {financial?.processing_allowed&&item.status==='FAILED'&&order.status!=='REFUNDED'&&<RetryVideo id={item.item_id}/>}
   </div></article>;})}</div>
  <div className="details-grid"><section className="panel"><div className="panel-header"><h2>Histórico do pedido</h2></div><div className="panel-body"><div className="activity-line"><span className="activity-mark"/><div><strong>Pedido criado</strong><p>{dateTime(order.created_at)}</p></div></div><div className="activity-line"><span className="activity-mark"/><div><strong>Pagamento confirmado</strong><p>{dateTime(order.paid_at)}</p></div></div><div className="activity-line"><span className="activity-mark"/><div><strong>Disponibilizado ao cliente</strong><p>{dateTime(order.delivered_at)}</p></div></div></div></section>{financial&&<OrderFinanceActions key={`${id}-${financial.is_test}-${financial.fee_override_cents}`} order={financial}/>}</div>
 </>;
}
