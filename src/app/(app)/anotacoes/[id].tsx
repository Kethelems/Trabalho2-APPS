import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { AnotacaoDetalhe } from '@/components/anotacao-detalhe';
import { EmptyState } from '@/components/empty-state';
import { MensagemErro } from '@/components/mensagem-erro';
import { PrimaryButton } from '@/components/primary-button';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import type { Anotacao } from '@/models/usuario';
import { ApiError } from '@/services/api';

// DETALHES DA ANOTAÇÃO — src/app/(app)/anotacoes/[id].tsx  ->  rota "/anotacoes/<id>"
//
// Recebe só o id pela rota e busca a anotação no servidor (GET /anotacoes/:id).

// Um estado só, com um caso para cada situação da tela. Assim não tem como
// estar "carregando" e "com erro" ao mesmo tempo, e o TypeScript sabe que
// `anotacao` só existe no caso 'pronta'.
type EstadoDaTela =
  | { tipo: 'carregando' }
  | { tipo: 'nao-encontrada' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'pronta'; anotacao: Anotacao };

export default function DetalhesAnotacaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { apiLogada } = useAuth();

  const [estado, setEstado] = useState<EstadoDaTela>({ tipo: 'carregando' });

  // busca de novo se o id mudar
  useEffect(() => {
    buscar();
  }, [id]);

  async function buscar() {
    setEstado({ tipo: 'carregando' });
    try {
      setEstado({ tipo: 'pronta', anotacao: await apiLogada.buscarAnotacao(id) });
    } catch (e) {
      // 404 = não existe ou é de outra pessoa (o servidor não diferencia)
      if (e instanceof ApiError && e.status === 404) {
        setEstado({ tipo: 'nao-encontrada' });
      } else {
        setEstado({
          tipo: 'erro',
          mensagem: e instanceof Error ? e.message : 'Erro ao buscar a anotação.',
        });
      }
    }
  }

  switch (estado.tipo) {
    case 'carregando':
      return (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );

    case 'nao-encontrada':
      return (
        <View style={styles.centro}>
          <Stack.Screen options={{ title: 'Não encontrada' }} />
          <EmptyState
            titulo="Essa anotação não está disponível"
            descricao="Ela pode ter sido apagada ou ser de outra conta."
          />
        </View>
      );

    case 'erro':
      return (
        <View style={styles.centro}>
          <MensagemErro>{estado.mensagem}</MensagemErro>
          <PrimaryButton label="Tentar de novo" variant="secondary" onPress={buscar} />
        </View>
      );

    case 'pronta':
      return (
        <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
          <AnotacaoDetalhe anotacao={estado.anotacao} />
        </ScrollView>
      );
  }
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  conteudo: {
    padding: Spacing.lg,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
});
