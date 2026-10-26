import type { Metadata } from 'next';
import { AdminNav } from '@/components/admin-nav';
import './globals.css';
export const metadata:Metadata={title:'Recado Animado · Operações',description:'Pedidos, vídeos e resultados da loja Recado Animado.'};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="pt-BR"><body><a className="skip-link" href="#main-content">Pular para o conteúdo</a><div className="admin-shell"><AdminNav/><div className="admin-workspace">
  <header className="workspace-topbar"><div><span className="topbar-dot"/>Administração da loja <span className="topbar-divider">/</span><span className="muted">Recado Animado</span></div>
   <form action="/manager/orders" method="get" role="search"><label className="sr-only" htmlFor="global-search">Buscar pedido ou e-mail</label><input id="global-search" type="search" name="q" placeholder="Buscar pedido ou e-mail…"/><button type="submit" aria-label="Buscar">↵</button></form>
  </header><main id="main-content" className="admin-main">{children}</main><footer className="workspace-footer">Recado Animado · Operação da loja<span>Valores em BRL, salvo indicação em USD.</span></footer>
 </div></div></body></html>;
}
