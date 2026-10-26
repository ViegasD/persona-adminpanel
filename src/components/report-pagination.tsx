import Link from 'next/link';
export function ReportPagination({base,params,total,page,size=50}:{base:string;params:Record<string,string|undefined>;total:number;page:number;size?:number}){
 const href=(next:number)=>{const q=new URLSearchParams();for(const[k,v]of Object.entries(params))if(v&&k!=='page')q.set(k,v);q.set('page',String(next));return `${base}?${q}`;};
 return <div className="pagination"><span>{total?`${(page-1)*size+1}–${Math.min(page*size,total)} de ${total} pedidos`:'Nenhum pedido'}</span><nav aria-label="Paginação">{page>1&&<Link className="button secondary" href={href(page-1)}>← Anterior</Link>}{page*size<total&&<Link className="button secondary" href={href(page+1)}>Próxima →</Link>}</nav></div>;
}
