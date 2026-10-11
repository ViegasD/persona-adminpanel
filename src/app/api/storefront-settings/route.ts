import { NextRequest, NextResponse } from 'next/server';
import { storefrontSettingsRequest } from '@/lib/storefront-settings-api';

export async function PUT(request: NextRequest) {
  if (!process.env.ADMIN_PASS) return NextResponse.json({ error: 'Senha de administrador obrigatoria.' }, { status: 503 });
  const origin = request.headers.get('origin');
  try {
    if (!origin || new URL(origin).host !== request.headers.get('host')) return NextResponse.json({ error: 'Origem invalida.' }, { status: 403 });
  } catch { return NextResponse.json({ error: 'Origem invalida.' }, { status: 403 }); }
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Dados invalidos.' }, { status: 400 }); }
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Dados invalidos.' }, { status: 400 });
  try {
    if (body.kind === 'policy') return NextResponse.json(await storefrontSettingsRequest('storefront-settings', 'PUT', body.values));
    if (body.kind === 'plan' && Number.isSafeInteger(body.id) && body.id > 0) return NextResponse.json(await storefrontSettingsRequest(`plans/${body.id}`, 'PUT', body.values));
    return NextResponse.json({ error: 'Dados invalidos.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro ao salvar.' }, { status: 502 });
  }
}
