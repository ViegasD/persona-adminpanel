import Link from 'next/link';
export default function NotFound(){return <section className="empty-state"><h1>Página não encontrada</h1><p>Confira o endereço ou encontre o pedido na lista.</p><Link className="button" href="/orders">Ir para pedidos</Link></section>;}
