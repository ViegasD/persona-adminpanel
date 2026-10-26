'use client';

import { useTransition, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { PendingItem } from '@/lib/storefront-api';
import { approveItemAction, rejectItemAction, retryItemAction } from '@/lib/storefront-actions';

export function ApprovalCard({ item }: { item: PendingItem }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [error,setError]=useState('');
  const [confirmRetry,setConfirmRetry]=useState(false);

  function handleApprove() {
    startTransition(async () => {
      setError('');
      try{await approveItemAction(item.item_id);router.refresh();}
      catch(e){setError(e instanceof Error?e.message:'Não foi possível aprovar.');}
    });
  }

  function handleReject() {
    startTransition(async () => {
      setError('');
      try{await rejectItemAction(item.item_id);router.refresh();}
      catch(e){setError(e instanceof Error?e.message:'Não foi possível rejeitar.');}
    });
  }

  function handleRetry() {
    startTransition(async () => {
      setError('');
      try{await retryItemAction(item.item_id);setConfirmRetry(false);router.refresh();}
      catch(e){setError(e instanceof Error?e.message:'Não foi possível gerar novamente.');}
    });
  }

  return (
    <div
      className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)] shadow-sm"
      style={{ opacity: isPending ? 0.5 : 1, pointerEvents: isPending ? 'none' : undefined }}
    >
      {/* Preview */}
      <div className="aspect-[9/16] bg-[var(--muted)] relative flex items-center justify-center">
        {item.preview_url ? (
          item.preview_type === 'video' ? (
            <video
              src={item.preview_url}
              controls
              preload="none"
              playsInline
              aria-label={`Prévia do pedido ${item.order_id}`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.preview_url}
              alt={`Cena do pedido ${item.order_id}`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )
        ) : (
          <span className="text-xs text-[var(--muted-foreground)]">Sem prévia</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <p className="text-sm font-medium">
          <Link className="text-link" href={`/orders/${item.order_id}`}>Pedido #{item.order_id} · Item {item.sequence} →</Link>
        </p>
        {item.recipient_name && (
          <p className="text-xs text-[var(--muted-foreground)]">
            Para: {item.recipient_name}
            {item.recipient_age ? `, ${item.recipient_age} anos` : ''}
          </p>
        )}
        {item.occasion_slug && (
          <p className="text-xs text-[var(--muted-foreground)]">Ocasião: {item.occasion_slug}</p>
        )}
        <p className="text-xs text-[var(--muted-foreground)]">
          {item.is_multi_character ? '👥 Multi-personagem' : '👤 Personagem único'} ·{' '}
          {item.preview_type === 'image' ? 'Aprova imagem composta' : 'Aprova vídeo'}
        </p>
        <p className="text-xs text-[var(--muted-foreground)]">
          Personagens: {item.character_ids.join(', ')}
        </p>
      </div>

      {/* Actions */}
      <div className="px-3 pb-3 flex gap-2">
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{ background: 'var(--success)', color: 'var(--success-foreground, #fff)' }}
        >
          ✓ Aprovar
        </button>
        <button
          onClick={handleReject}
          disabled={isPending}
          className="flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{ background: 'var(--error)', color: 'var(--error-foreground, #fff)' }}
        >
          ✗ Rejeitar
        </button>
      </div>
      <div className="px-3 pb-3">
        {confirmRetry&&<p className="notice">Uma nova tentativa pode gerar custos. Confirme para continuar.</p>}
        <button
          onClick={()=>confirmRetry?handleRetry():setConfirmRetry(true)}
          disabled={isPending}
          className="w-full py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
        >
          {confirmRetry?'Confirmar nova geração':'Regenerar vídeo'}
        </button>
        {confirmRetry&&<button className="text-link" disabled={isPending} onClick={()=>setConfirmRetry(false)}>Cancelar</button>}
        <p role="status" className="form-message negative">{error}</p>
      </div>
    </div>
  );
}
