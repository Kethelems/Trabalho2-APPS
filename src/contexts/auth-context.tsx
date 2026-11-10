import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { Sessao, Usuario } from '@/models/usuario';
import { api, ApiError } from '@/services/api';
import { criarApiLogada, type ApiLogada } from '@/services/api-logada';

// CONTEXTO DE AUTENTICAÇÃO — src/contexts/auth-context.tsx
//
// O problema: quem está logado interessa a MUITAS telas (o cabeçalho mostra
// o nome, o layout decide quais rotas existem, a lista busca dados com o
// token). Passar isso por props, tela a tela, não escala — e o layout raiz
// nem tem como passar props para as telas do Expo Router.
//
// A solução da Context API tem três peças:
//
//   1. createContext()  — cria o "canal";
//   2. <AuthProvider>   — o componente que GUARDA o estado e o coloca no canal,
//                         envolvendo a parte da árvore que precisa dele;
//   3. useAuth()        — o hook que qualquer componente abaixo do provider
//                         usa para LER o canal.
//
// Quando o valor do provider muda (alguém entrou ou saiu), todos os
// componentes que chamaram useAuth() são re-renderizados — como se o estado
// fosse deles.

// No AsyncStorage fica só o token. O usuário vem do servidor (GET /auth/me)
// toda vez que o app abre.
const CHAVE_TOKEN = '@trabalho02/token';

// Por que o login está aparecendo. A tela de login decide o texto.
export type AvisoLogin = 'sessao-expirada' | 'servidor-fora-do-ar';

// O que fica disponível para quem chamar useAuth().
interface AuthContextValue {
  // null = ninguém logado. É este valor que os layouts consultam para
  // decidir quais rotas estão acessíveis.
  usuario: Usuario | null;
  // O token vai no cabeçalho de toda requisição autenticada.
  token: string | null;
  // true durante o login/cadastro (4.2)
  carregando: boolean;
  // true enquanto confere o token salvo, quando o app abre (4.5)
  verificandoSessao: boolean;
  avisoLogin: AvisoLogin | null;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  // chamadas ao servidor que precisam de login, já com o token (4.1)
  apiLogada: ApiLogada;
}

// 1. O canal. O valor inicial (null) só é visto por quem chamar useAuth()
// FORA de um provider — e o hook trata isso como erro de programação.
const AuthContext = createContext<AuthContextValue | null>(null);

// 2. O provider: um componente comum, com useState comum. A única diferença
// para qualquer outro componente é que ele entrega o estado via contexto,
// e não via props.
export function AuthProvider({ children }: { children: ReactNode }) {
  // Token e usuário mudam sempre juntos, então vivem em um único estado.
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [carregando, setCarregando] = useState(false);
  // começa true: enquanto não conferir o token salvo, o layout não monta as
  // rotas (senão o login aparece por um instante)
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [avisoLogin, setAvisoLogin] = useState<AvisoLogin | null>(null);

  useEffect(() => {
    conferirSessaoSalva();
  }, []);

  async function conferirSessaoSalva() {
    try {
      const tokenSalvo = await AsyncStorage.getItem(CHAVE_TOKEN);
      if (tokenSalvo) {
        const usuario = await api.perfil(tokenSalvo);
        setSessao({ token: tokenSalvo, usuario });
      }
    } catch (e) {
      const status = e instanceof ApiError ? e.status : null;
      if (status === 0) {
        // servidor fora do ar: não dá pra saber se o token vale. Ele continua
        // salvo, mas o app não entra sem conferir.
        setAvisoLogin('servidor-fora-do-ar');
      } else {
        // 401 (token morto) ou qualquer outro problema: esquece o token
        await AsyncStorage.removeItem(CHAVE_TOKEN).catch(() => {});
        if (status === 401) setAvisoLogin('sessao-expirada');
      }
    } finally {
      setVerificandoSessao(false);
    }
  }

  // Entra no app e guarda o token. Se o armazenamento falhar, entra mesmo
  // assim: a sessão só não sobrevive ao próximo reload.
  async function iniciarSessao(novaSessao: Sessao) {
    setSessao(novaSessao);
    try {
      await AsyncStorage.setItem(CHAVE_TOKEN, novaSessao.token);
    } catch {
      console.warn('Não foi possível guardar o token no AsyncStorage.');
    }
  }

  // Login e cadastro só mudam a chamada ao servidor. O `finally` garante que
  // a tela de espera some mesmo quando dá erro.
  async function autenticar(chamada: () => Promise<Sessao>) {
    setAvisoLogin(null);
    setCarregando(true);
    try {
      await iniciarSessao(await chamada());
    } finally {
      setCarregando(false);
    }
  }

  async function entrar(email: string, senha: string) {
    // Se o servidor recusar, api.login lança um erro — e ele sobe até a
    // tela de login, que é quem sabe mostrar a mensagem. O provider não trata.
    await autenticar(() => api.login(email, senha));
    // Repare: NENHUMA navegação aqui. Mudar o estado basta — o layout raiz
    // lê `usuario` e troca as rotas disponíveis sozinho.
  }

  async function cadastrar(nome: string, email: string, senha: string) {
    // O servidor já devolve a sessão no cadastro: quem se cadastra entra.
    await autenticar(() => api.cadastrar(nome, email, senha));
  }

  // Limpa a sessão no app e no aparelho. Usada pelo botão Sair e pela
  // apiLogada quando chega um 401.
  async function encerrarSessao(expirou: boolean) {
    const tokenAtual = sessao?.token;
    setSessao(null);
    setAvisoLogin(expirou ? 'sessao-expirada' : null);
    await AsyncStorage.removeItem(CHAVE_TOKEN);

    // Só avisa o servidor no logout normal. Se expirou, o token já não
    // existe lá e o POST /auth/logout daria 401 de novo.
    if (tokenAtual && !expirou) {
      await api.sair(tokenAtual).catch(() => {});
    }
  }

  async function sair() {
    await encerrarSessao(false);
  }

  // Muda junto com o token: quando alguém entra ou sai, as telas recebem a
  // versão nova. O 401 de qualquer chamada dela cai no encerrarSessao(true).
  const apiLogada = criarApiLogada(sessao?.token ?? null, () => encerrarSessao(true));

  // No React 19 o próprio contexto é o provider. Antes se escrevia
  // <AuthContext.Provider value={...}> — as duas formas funcionam.
  return (
    <AuthContext
      value={{
        usuario: sessao?.usuario ?? null,
        token: sessao?.token ?? null,
        carregando,
        verificandoSessao,
        avisoLogin,
        entrar,
        cadastrar,
        sair,
        apiLogada,
      }}>
      {children}
    </AuthContext>
  );
}

// 3. O hook. Encapsula o useContext e falha cedo, com uma mensagem clara,
// se alguém esquecer o provider — em vez de um "cannot read property
// 'usuario' of null" em uma tela qualquer.
export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (contexto === null) {
    throw new Error('useAuth() só pode ser usado dentro de <AuthProvider>.');
  }
  return contexto;
}
