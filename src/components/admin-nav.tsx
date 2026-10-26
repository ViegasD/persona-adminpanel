'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links=[['/','Visão geral','overview'],['/orders','Pedidos','orders'],['/videos','Vídeos','videos'],['/finance','Financeiro','finance'],['/customers','Clientes','customers'],['/characters','Personagens','characters'],['/settings','Configurações','settings']] as const;
function Icon({name}:{name:string}){
 const paths:Record<string,React.ReactNode>={
  overview:<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  orders:<><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/></>,
  finance:<><path d="M3 20h18M6 16V9m6 7V4m6 12v-5"/></>,
  videos:<><rect x="3" y="3" width="18" height="18" rx="4"/><path d="m10 8 6 4-6 4V8Z"/></>,
  customers:<><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2m2-15a3 3 0 0 1 0 6m2 9v-2a6 6 0 0 0-3-5"/></>,
  characters:<><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10h.01M16 10h.01M8 15c2 2 6 2 8 0"/></>,
  settings:<><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></>,
 };
 return <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
export function AdminNav(){
 const pathname=usePathname().replace(/^\/manager(?=\/|$)/,'')||'/';
 return <aside className="admin-sidebar">
  <Link href="/" className="admin-brand"><span className="brand-symbol" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="1.5"/><path d="m10 7 7 5-7 5V7Z" fill="currentColor"/></svg></span><span>Recado Animado<small>Estúdio · Operações</small></span></Link>
  <p className="nav-eyebrow">Sua operação</p>
  <nav aria-label="Navegação principal" className="primary-nav">{links.map(([href,label,icon])=>{
   const active=href==='/'?pathname==='/':pathname.startsWith(href);
   return <Link key={href} href={href} className={`nav-item ${active?'is-active':''}`} aria-current={active?'page':undefined}><Icon name={icon}/><span>{label}</span>{active&&<span className="nav-dot"/>}</Link>;
  })}</nav>
  <nav className="secondary-nav" aria-label="Outras ferramentas"><Link href="/affiliates">Afiliados <span aria-hidden="true">↗</span></Link><Link href="/legacy">Ferramentas legadas <span aria-hidden="true">↗</span></Link></nav>
  <div className="sidebar-footer"><span className="online-dot"/>Painel administrativo<a href="https://recadoanimado.com" target="_blank" rel="noopener noreferrer">Abrir a loja ↗</a></div>
 </aside>;
}
