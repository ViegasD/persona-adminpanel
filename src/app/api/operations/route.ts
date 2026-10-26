import {NextRequest,NextResponse} from 'next/server';
import {storefrontSettingsRequest} from '@/lib/storefront-settings-api';
export async function POST(request:NextRequest){
 if(!process.env.ADMIN_PASS)return NextResponse.json({error:'Autenticação de administrador não configurada.'},{status:503});
 try{if(new URL(request.headers.get('origin')||'').host!==request.headers.get('host'))return NextResponse.json({error:'Origem inválida.'},{status:403});}catch{return NextResponse.json({error:'Origem inválida.'},{status:403});}
 try{
  const body=await request.json();const valid=Number.isSafeInteger(body.id)&&body.id>0;
  if(body.kind==='finance-settings')return NextResponse.json(await storefrontSettingsRequest('finance/settings','PUT',body.values));
  if(body.kind==='finance-note'&&valid)return NextResponse.json(await storefrontSettingsRequest(`orders/${body.id}/finance-note`,'PUT',body.values));
  if(body.kind==='reconcile-fees'&&valid)return NextResponse.json(await storefrontSettingsRequest(`orders/${body.id}/reconcile-fees`,'POST'));
  if(body.kind==='retry-item'&&valid)return NextResponse.json(await storefrontSettingsRequest(`items/${body.id}/retry`,'POST'));
  return NextResponse.json({error:'Operação inválida.'},{status:400});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Não foi possível salvar.'},{status:502});}
}
