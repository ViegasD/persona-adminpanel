'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <section className="empty-state"><h1>Não foi possível abrir esta página</h1><p>Seus pedidos permanecem preservados. Tente carregar os dados novamente.</p><button className="button" onClick={reset}>Tentar novamente</button></section>;}
