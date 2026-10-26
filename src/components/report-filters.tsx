export function ReportFilters({action,params,finance=false}:{action:string;params:Record<string,string|undefined>;finance?:boolean}){
 return <form className="filter-bar" action={action} method="get">
  <label className="grow">Buscar<input name="q" type="search" placeholder="Número do pedido, nome ou e-mail" defaultValue={params.q}/></label>
  <label>Status<select name="status" defaultValue={params.status||''}><option value="">Todos os status</option>{[['AWAITING_PAYMENT','Aguardando pagamento'],['PAID','Pago'],['GENERATING','Em geração'],['DELIVERED','Entregue'],['FAILED','Falhou'],['REFUNDED','Reembolsado']].map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
  <label>De<input type="date" name="date_from" defaultValue={params.date_from}/></label><label>Até<input type="date" name="date_to" defaultValue={params.date_to}/></label>
  <label className="check"><input type="checkbox" name="include_tests" value="true" defaultChecked={params.include_tests==='true'}/>Incluir testes</label>
  {!finance&&<label className="check"><input type="checkbox" name="attention" value="true" defaultChecked={params.attention==='true'}/>Só pendências</label>}
  <button className="button" type="submit">Aplicar filtros</button><a className="text-link" href={action}>Limpar</a>
 </form>;
}
