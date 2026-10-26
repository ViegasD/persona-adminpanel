import {PageHeader} from '@/components/operations-ui';
import { fetchAffiliates } from '@/lib/storefront-api';
import { AffiliatesClient } from './affiliates-client';

export default async function AffiliatesPage() {
  let affiliates;
  try {
    affiliates = await fetchAffiliates();
  } catch {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--error)] text-lg font-medium">Erro ao carregar afiliados</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Parcerias" title="Afiliados" description={`${affiliates.length} cadastros · acompanhe indicações e comissões.`}/>
      <AffiliatesClient affiliates={affiliates} />
    </div>
  );
}
