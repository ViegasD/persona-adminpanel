'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import type {Revision,Engagement} from '@/lib/operations-types';
import {dateTime} from './operations-ui';

const statuses:Record<string,string>={QUEUED:'Na fila',GENERATING:'Em geração',READY:'Pronta para revisão',CHECK_REQUIRED:'Conferência necessária',FAILED:'Falhou',PUBLISHED:'Publicada',DISCARDED:'Descartada'};
export function VideoOperations({id,status,allowed,multiple,revisions,engagement,error}:{id:number;status:string;allowed:boolean;multiple:boolean;revisions:Revision[];engagement?:Engagement;error?:string|null}){
 const router=useRouter();const[busy,setBusy]=useState(false);const[message,setMessage]=useState('');
 const[open,setOpen]=useState(false);const[voice,setVoice]=useState('catalog');const[reuse,setReuse]=useState(true);
 const[key,setKey]=useState<string|null>(null);const[confirmation,setConfirmation]=useState<{kind:string;id:number}|null>(null);
 const active=revisions.some(r=>['QUEUED','GENERATING','READY','CHECK_REQUIRED'].includes(r.status));
 const latestRevision=revisions.reduce<Revision|undefined>((latest,row)=>!latest||row.id>latest.id?row:latest,undefined);
 const sceneRejected=Boolean(error?.includes('scene failed'))||(latestRevision?.status==='FAILED'&&latestRevision.phase==='scene_review');
 async function run(kind:string,target:number,values?:unknown){setBusy(true);setMessage('');try{
  const response=await fetch('/manager/api/operations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,id:target,values})});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Não foi possível concluir.');
  setMessage(kind==='revision-publish'?'Versão publicada na conta do cliente.':kind==='revision-create'?'Geração na fila. A nova versão ficará aqui para aprovação.':'Operação concluída.');
  setOpen(false);setConfirmation(null);if(kind==='revision-create')setKey(null);router.refresh();
 }catch(error){setMessage(error instanceof Error?error.message:'Erro na operação.');}finally{setBusy(false);}}
 return <section className="video-operations" aria-label={`Operações do vídeo ${id}`}>
  <h3>Acesso do cliente</h3><dl className="breakdown engagement"><div><dt>Reprodução iniciada</dt><dd>{engagement?.viewed_at?dateTime(engagement.viewed_at):'Sem registro ainda'}</dd></div><div><dt>Reprodução chegou ao fim</dt><dd>{engagement?.completed_at?dateTime(engagement.completed_at):'Sem registro ainda'}</dd></div><div><dt>Clicou em baixar</dt><dd>{engagement?.downloaded_at?dateTime(engagement.downloaded_at):'Sem registro ainda'}</dd></div></dl>
  <p className="form-help">Registros desta versão, a partir desta atualização. Prévias da equipe não contam como acesso do cliente.</p>
  {engagement?.ratings.map((rating,i)=><blockquote className="customer-rating" key={i}><strong><span className="rating-stars" role="img" aria-label={`${rating.score} de 5 estrelas`}>{'★'.repeat(rating.score)}{'☆'.repeat(5-rating.score)}</span> · {dateTime(rating.rated_at)}</strong>{rating.comment&&<p>{rating.comment}</p>}</blockquote>)}
  {allowed&&['FAILED','READY'].includes(status)&&!active&&!open&&<button className="button secondary" onClick={()=>{setReuse(!sceneRejected);setOpen(true);setKey(crypto.randomUUID());}}>{status==='FAILED'?'Retomar geração':'Gerar nova versão'}</button>}
  {open&&<form onSubmit={e=>{e.preventDefault();run('revision-create',id,{request_key:key,voice,reuse_scene:reuse});}} className="revision-form"><fieldset disabled={busy}><legend>Nova versão para revisão</legend><p className="form-help">Esta operação usa créditos do provedor. Confira o saldo após a recarga. O vídeo atual continua disponível até você publicar a substituição.</p>
   <label className="form-label">Voz<select className="form-control" value={voice} onChange={e=>setVoice(e.target.value)} disabled={multiple}><option value="catalog">Voz definida no catálogo</option><option value="male">Masculina</option><option value="female">Feminina</option></select></label>
   <label className="checkbox-label"><input type="checkbox" checked={reuse} onChange={e=>setReuse(e.target.checked)}/>Reutilizar a cena existente, se disponível</label><p className="form-help">Desmarcar cria uma nova imagem e adiciona o custo dessa geração.</p>
   <div className="note-actions"><button className="button" type="submit">Confirmar geração com custo</button><button type="button" className="text-link" onClick={()=>setOpen(false)}>Cancelar</button></div>
  </fieldset></form>}
  {revisions.length>0&&<div className="revision-list"><div className="note-actions"><h3>Versões e recuperação</h3><button className="text-link" onClick={()=>router.refresh()} disabled={busy}>Atualizar progresso</button></div>{revisions.map(r=><article className="revision" key={r.id}><div className="note-actions"><strong>Versão #{r.id}</strong><span>{statuses[r.status]||r.status}</span></div><p className="form-help">{dateTime(r.created_at)}{r.duration?` · ${r.duration}s`:''}{r.model?` · ${r.model}`:''}</p>
   {r.error&&<p className="notice error">{r.error}</p>}
   {r.video_url&&<video controls playsInline preload="none" src={r.video_url} aria-label={`Prévia privada da versão ${r.id}`}/>}
   {r.scene_url&&<details><summary>Ver cena desta versão</summary>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={r.scene_url} alt={`Cena da versão ${r.id}`} loading="lazy"/></details>}
   {allowed&&<div className="note-actions">{r.status==='READY'&&<button className="button" disabled={busy} onClick={()=>setConfirmation({kind:'revision-publish',id:r.id})}>Publicar versão aprovada</button>}{['CHECK_REQUIRED','GENERATING'].includes(r.status)&&<button className="button secondary" disabled={busy} onClick={()=>run('revision-resume',r.id)}>Consultar / retomar tarefa existente</button>}{['QUEUED','READY','CHECK_REQUIRED'].includes(r.status)&&<button className="text-link" disabled={busy} onClick={()=>setConfirmation({kind:'revision-discard',id:r.id})}>Descartar versão</button>}</div>}
  </article>)}</div>}
  {confirmation&&<div className="notice" role="group" aria-label="Confirmar operação"><p>{confirmation.kind==='revision-publish'?'Você revisou imagem, áudio e conteúdo? Esta versão substituirá o vídeo disponível na conta do cliente.':'Descartar remove esta versão da revisão. Os custos já gerados continuam registrados. Se houve submissão sem confirmação, confira também o histórico do provedor.'}</p><div className="note-actions"><button className="button" disabled={busy} onClick={()=>run(confirmation.kind,confirmation.id)}>Confirmar {confirmation.kind==='revision-publish'?'publicação':'descarte'}</button><button className="text-link" disabled={busy} onClick={()=>setConfirmation(null)}>Cancelar</button></div></div>}
  <p className="form-message" role="status" aria-live="polite">{message}{busy?' Processando…':''}</p>
 </section>;
}
