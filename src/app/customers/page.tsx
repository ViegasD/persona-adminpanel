import {storefrontSettingsRequest} from '@/lib/storefront-settings-api';
import {PageHeader,ErrorState,Empty,dateTime} from '@/components/operations-ui';
export const dynamic='force-dynamic';
type Customer={id:number;email:string;name:string|null;verified:boolean;credits:number;orders:number;created_at:string};
export default async function Customers({searchParams}:{searchParams:Promise<{q?:string;page?:string}>}){
 const p=await searchParams;const page=Math.max(1,Math.floor(Number(p.page)||1));const query=new URLSearchParams({q:p.q||'',offset:String((page-1)*50)});
 const customers=await storefrontSettingsRequest<Customer[]>(`customers?${query}`).catch(()=>null);
 if(!customers)return <ErrorState/>;
 return <><PageHeader eyebrow="Contas da loja" title="Clientes" description="Contas cadastradas, confirmação de e-mail e pedidos vinculados. Compras de convidados também podem ser encontradas em Pedidos."/>
  <form className="filter-bar" action="/manager/customers"><label className="grow">E-mail do cliente<input name="q" type="search" defaultValue={p.q} placeholder="Buscar conta por e-mail"/></label><button className="button">Buscar</button></form>
  {customers.length?<section className="panel"><div className="table-wrap"><table className="data-table"><thead><tr><th>Cliente</th><th>E-mail</th><th>Confirmação</th><th>Pedidos</th><th>Créditos</th><th>Cadastro</th></tr></thead><tbody>{customers.map(c=><tr key={c.id}><td className="cell-main">{c.name||`Conta #${c.id}`}</td><td><a className="text-link" href={`/manager/orders?q=${encodeURIComponent(c.email||'')}`}>{c.email||'Sem e-mail'}</a></td><td><span className={`status-badge ${c.verified?'status-ready':'status-awaiting_payment'}`}>{c.verified?'Verificado':'Pendente'}</span></td><td>{c.orders}</td><td>{c.credits}</td><td>{dateTime(c.created_at)}</td></tr>)}</tbody></table></div></section>:<Empty title="Nenhuma conta encontrada" description="Tente outro e-mail. Pedidos sem conta ficam na lista de pedidos."/>}
  <div className="pagination"><span>Até 50 contas por página</span><nav>{page>1&&<a className="button secondary" href={`/manager/customers?q=${encodeURIComponent(p.q||'')}&page=${page-1}`}>← Anterior</a>}{customers.length===50&&<a className="button secondary" href={`/manager/customers?q=${encodeURIComponent(p.q||'')}&page=${page+1}`}>Próxima →</a>}</nav></div>
 </>;
}
