import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AnotacaoModeracaoItem } from '@/components/anotacao-moderacao-item';
import { EmptyState } from '@/components/empty-state';
import { Header } from '@/components/header';
import { MensagemErro } from '@/components/mensagem-erro';
import { Note } from '@/components/note';
import { PrimaryButton } from '@/components/primary-button';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import type { AnotacaoComAutor } from '@/models/usuario';

// MODERAÇÃO — src/app/(app)/moderacao.tsx  ->  rota "/moderacao"
//
// Só aparece pra moderador e admin (ver (app)/_layout.tsx). O servidor
// também bloqueia: GET /moderacao/anotacoes dá 403 pra `usuario`.
export default function ModeracaoScreen() {
  const { usuario, apiLogada } = useAuth();

  const [lista, setLista] = useState<AnotacaoComAutor[]>([]);
  const [buscando, setBuscando] = useState(true);
  const [falha, setFalha] = useState<string | null>(null);

  useEffect(() => {
    atualizar();
  }, []);

  async function atualizar() {
    setFalha(null);
    setBuscando(true);
    try {
      setLista(await apiLogada.listarAnotacoesModeracao());
    } catch (e) {
      // 403 cai aqui também: mostra a mensagem do servidor e não desloga
      setFalha(e instanceof Error ? e.message : 'Erro ao buscar as anotações.');
    } finally {
      setBuscando(false);
    }
  }

  // quantas pessoas diferentes escreveram
  const autores = new Set(lista.map((anotacao) => anotacao.usuarioId)).size;

  return (
    <FlatList
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      data={lista}
      keyExtractor={(anotacao) => anotacao.id}
      renderItem={({ item }) => (
        <AnotacaoModeracaoItem anotacao={item} doUsuarioAtual={item.usuarioId === usuario?.id} />
      )}
      ItemSeparatorComponent={() => <View style={styles.separador} />}
      ListHeaderComponent={
        <View style={styles.cabecalho}>
          <Header title="Moderação" subtitle="Anotações de todas as contas" />
          <MensagemErro>{falha}</MensagemErro>
          {!buscando && !falha && lista.length > 0 ? (
            <Text style={styles.resumo}>
              {lista.length} {lista.length === 1 ? 'anotação' : 'anotações'} de {autores}{' '}
              {autores === 1 ? 'pessoa' : 'pessoas'}
            </Text>
          ) : null}
          <PrimaryButton
            label={buscando ? 'Buscando…' : 'Recarregar lista'}
            variant="secondary"
            onPress={atualizar}
            disabled={buscando}
          />
        </View>
      }
      ListEmptyComponent={
        buscando ? (
          <EmptyState titulo="Buscando…" />
        ) : falha ? null : (
          <EmptyState
            titulo="Lista vazia"
            descricao="Nenhuma anotação cadastrada no sistema."
          />
        )
      }
      ListFooterComponent={
        <View style={styles.rodape}>
          <Note>
            Esta lista também é protegida no servidor: com o token da Ana a
            rota responde 403.
          </Note>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  conteudo: {
    padding: Spacing.lg,
  },
  cabecalho: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  resumo: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  separador: {
    height: Spacing.sm,
  },
  rodape: {
    marginTop: Spacing.lg,
  },
});
