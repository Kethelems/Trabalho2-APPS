import { api, ApiError } from '@/services/api';

// API LOGADA — src/services/api-logada.ts
//
// As chamadas que precisam de login, já com o token da sessão. O AuthProvider
// monta este objeto e entrega pelo contexto, então as telas só fazem
// `apiLogada.listarAnotacoes()`, sem passar token nenhum.
//
// Requisito 4.1: é aqui que o 401 é tratado, para todas as telas de uma vez.
export function criarApiLogada(token: string | null, quandoExpirar: () => Promise<void>) {
  // Toda chamada passa por esta função. Se o servidor responder 401, o token
  // não vale mais: avisa o contexto (que desloga) e repassa o erro pra tela.
  // 403, 404 e os outros erros só são repassados, sem deslogar.
  async function protegida<T>(requisicao: Promise<T>): Promise<T> {
    try {
      return await requisicao;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await quandoExpirar();
      }
      throw e;
    }
  }

  return {
    perfil: () => protegida(api.perfil(token)),
    listarAnotacoes: () => protegida(api.listarAnotacoes(token)),
    criarAnotacao: (texto: string) => protegida(api.criarAnotacao(token, texto)),
    buscarAnotacao: (id: string) => protegida(api.buscarAnotacao(token, id)),
    listarAnotacoesModeracao: () => protegida(api.listarAnotacoesModeracao(token)),
    listarUsuarios: () => protegida(api.listarUsuarios(token)),
  };
}

export type ApiLogada = ReturnType<typeof criarApiLogada>;
