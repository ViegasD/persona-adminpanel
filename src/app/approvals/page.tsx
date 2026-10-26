import { fetchPendingApprovals } from '@/lib/storefront-api';
import { ApprovalCard } from '@/components/approval-card';
import Link from 'next/link';
import {PageHeader,Empty,ErrorState} from '@/components/operations-ui';

export default async function ApprovalsPage() {
  let items;
  try {
    items = await fetchPendingApprovals();
  } catch {
    return <ErrorState/>;
  }

  return (
    <div>
      <PageHeader eyebrow="Controle de qualidade" title="Revisões pendentes" description={`${items.length} item(ns) aguardando revisão. Confira a cena, o personagem e a mensagem antes de aprovar.`}><Link className="button secondary" href="/videos">Voltar aos vídeos</Link></PageHeader>

      {items.length === 0 ? (
        <Empty title="Nenhuma revisão pendente" description="Novos itens aparecem aqui quando a revisão manual está habilitada."/>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <ApprovalCard key={item.item_id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
