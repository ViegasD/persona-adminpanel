/** Do not expose proxy HTML or JSON parser errors to operators. */
export async function readOperationResponse<T=Record<string,unknown>>(response: Response): Promise<T> {
  const fallback=response.status===401
    ? 'Sua sessão expirou. Recarregue a página e entre novamente.'
    : 'O servidor não retornou uma resposta válida. Atualize o progresso antes de tentar novamente; a operação pode ter sido recebida.';
  let data:unknown;
  try { data=await response.json(); } catch { throw new Error(fallback); }
  if(!data||typeof data!=='object')throw new Error(fallback);
  const result=data as Record<string,unknown>;
  if(!response.ok)throw new Error(typeof result.error==='string'?result.error:typeof result.detail==='string'?result.detail:fallback);
  return data as T;
}
