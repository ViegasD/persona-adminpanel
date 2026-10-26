import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchOrderVideos } from '@/lib/storefront-api';

export default async function OrderVideosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1) notFound();
  let order;
  try { order = await fetchOrderVideos(Number(id)); }
  catch { return <section><Link className="underline" href="/orders">Voltar aos pedidos</Link><p role="alert" className="mt-4">Não foi possível carregar este pedido. Atualize a página para tentar novamente.</p></section>; }
  return <section className="space-y-6">
    <Link className="text-sm underline" href="/orders">Voltar aos pedidos</Link>
    <header><h2 className="text-xl font-semibold">Vídeos do pedido #{order.order_id}</h2><p className="text-sm text-[var(--muted-foreground)]">{order.recipient_name || 'Destinatário informado por vídeo'} · {order.status}</p></header>
    <p className="text-sm">Use os controles para assistir com áudio, avançar ou abrir em tela cheia. Se um link expirar, atualize esta página.</p>
    {order.items.length === 0 && <p>Nenhum vídeo neste pedido.</p>}
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{order.items.map(item => <article key={item.item_id} className="min-w-0 rounded-lg border border-[var(--border)] p-4 space-y-3">
      <h3 className="font-semibold">Vídeo {item.sequence} · Item #{item.item_id}</h3>
      <p className="text-sm">{item.character_ids.join(', ')} · {item.status}</p>
      {item.video_url ? <>
        <video controls playsInline preload="none" poster={item.thumbnail_url || undefined} aria-label={`Vídeo ${item.sequence} do pedido ${order.order_id}`} className="w-full max-h-[65vh] rounded bg-black object-contain" src={item.video_url}>
          Seu navegador não oferece reprodução de vídeo. Use o link abaixo.
        </video>
        <a className="block text-sm text-blue-600 underline" href={item.video_url} target="_blank" rel="noopener noreferrer">Abrir vídeo em outra aba</a>
      </> : <p role="status">Vídeo ainda não disponível.</p>}
      {item.scene_url && <details><summary className="cursor-pointer text-sm underline">Ver cena usada na geração</summary>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" alt={`Cena de referência do vídeo ${item.sequence}`} src={item.scene_url} className="mt-3 max-h-[60vh] w-full object-contain" />
      </details>}
    </article>)}</div>
  </section>;
}
