'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import type {FinanceOrder} from '@/lib/finance-api';
export function OrderFinanceActions({order}:{order:FinanceOrder}){
 const router=useRouter();const[busy,setBusy]=useState(false);const[message,setMessage]=useState('');
 const[isTest,setTest]=useState(order.is_test);const[note,setNote]=useState(order.note||'');
 const[fee,setFee]=useState(order.fee_override_cents==null?'':String(order.fee_override_cents/100));
 const[extra,setExtra]=useState(String(order.additional_cost_cents/100));
 async function run(kind:string,values?:unknown){setBusy(true);setMessage('');try{
  const response=await fetch('/manager/api/operations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,id:order.order_id,values})});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Falha ao salvar.');
  setMessage(kind==='reconcile-fees'?`Taxas consultadas: ${data.reconciled} pagamento(s).`:'Anotações salvas.');router.refresh();
 }catch(error){setMessage(error instanceof Error?error.message:'Erro ao salvar.');}finally{setBusy(false);}}
 return <section className="note-form"><h2 className="section-heading">Controle financeiro do pedido</h2><p className="form-help" style={{marginBottom:16}}>Estas anotações não alteram o pagamento nem os créditos do cliente.</p>
  <form onSubmit={e=>{e.preventDefault();run('finance-note',{is_test:isTest,note:note||null,fee_override_cents:fee===''?null:Math.round(Number(fee)*100),additional_cost_cents:Math.round(Number(extra||0)*100)});}}>
   <fieldset disabled={busy}><label className="form-label" style={{display:'flex',alignItems:'center',gap:8}}><input type="checkbox" checked={isTest} onChange={e=>setTest(e.target.checked)}/>Pedido de teste · excluir dos relatórios</label>
    <div className="form-grid"><label className="form-label">Taxa informada (R$)<input className="form-control" type="number" min="0" step="0.01" value={fee} onChange={e=>setFee(e.target.value)} placeholder="Usar taxa conciliada"/><span className="form-help">Deixe vazio para usar o provedor ou a estimativa configurada.</span></label><label className="form-label">Outros custos do pedido (R$)<input className="form-control" type="number" min="0" step="0.01" required value={extra} onChange={e=>setExtra(e.target.value)}/><span className="form-help">Custo adicional, dividido entre os vídeos.</span></label></div>
    <label className="form-label">Anotação interna<textarea className="form-control" rows={3} maxLength={2000} value={note} onChange={e=>setNote(e.target.value)} placeholder="Contexto de teste, retrabalho ou ajuste de custo"/></label>
    <div className="note-actions"><button className="button" type="submit">{busy?'Salvando…':'Salvar anotações'}</button><button className="button secondary" type="button" onClick={()=>run('reconcile-fees')}>Conciliar taxas do provedor</button></div>
   </fieldset>
  </form><p className="form-message" role="status" aria-live="polite">{message}</p>
 </section>;
}
export function RetryVideo({id}:{id:number}){
 const router=useRouter();const[confirm,setConfirm]=useState(false);const[busy,setBusy]=useState(false);const[message,setMessage]=useState('');
 async function retry(){setBusy(true);try{const r=await fetch('/manager/api/operations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'retry-item',id})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Falha ao reenviar.');setMessage('Nova tentativa colocada na fila.');setConfirm(false);router.refresh();}catch(e){setMessage(e instanceof Error?e.message:'Erro ao reenviar.');}finally{setBusy(false);}}
 return <div>{!confirm?<button className="button secondary" onClick={()=>setConfirm(true)}>Tentar geração novamente</button>:<div className="notice"><p>Uma nova tentativa pode gerar custos no provedor. Deseja continuar?</p><button className="button" disabled={busy} onClick={retry}>Confirmar nova tentativa</button> <button className="text-link" disabled={busy} onClick={()=>setConfirm(false)}>Cancelar</button></div>}<p role="status" className="form-message">{message}</p></div>;
}
