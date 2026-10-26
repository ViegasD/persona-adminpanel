import {NextRequest,NextResponse} from 'next/server';
import {fetchFinance} from '@/lib/finance-api';
const cell=(value:unknown)=>{let text=typeof value==='number'?String(value).replace('.',','):String(value??'');if(/^[=+@\-\t\r\n]/.test(text)&&typeof value==='string')text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
const amount=(cents:number|null)=>cents==null?'':Number((cents/100).toFixed(2));
export async function GET(request:NextRequest){try{
 const params=Object.fromEntries(request.nextUrl.searchParams);const report=await fetchFinance({...params,limit:200,offset:0});
 if(report.truncated)return NextResponse.json({error:'Refine o período para exportar até 5.000 pedidos completos.'},{status:422});
 let orders=report.items;
 for(let offset=200;offset<report.total;offset+=200)orders=orders.concat((await fetchFinance({...params,limit:200,offset})).items);
 const rows:unknown[][]=[['Pedido','Vídeo','Cliente','Status','Receita rateada BRL','Taxa BRL','Comissão BRL','IA registrada USD','IA BRL','Outros custos BRL','Margem BRL','Estimativa','Dados pendentes']];
 for(const order of orders)for(const item of order.items)rows.push([order.order_id,item.item_id,order.customer,item.status,amount(item.revenue_cents),amount(item.fee_cents),amount(item.commission_cents),(item.cost_micro_usd/1_000_000).toFixed(6).replace('.',','),amount(item.cost_brl_cents),amount(item.overhead_cents),amount(item.contribution_cents),item.estimated?'Sim':'Não',item.missing.join(' | ')]);
 return new NextResponse('\uFEFF'+rows.map(row=>row.map(cell).join(';')).join('\r\n'),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="recado-financeiro.csv"','Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'Não foi possível exportar o relatório.'},{status:502});}}
