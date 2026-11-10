import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import type { Anotacao } from '@/models/usuario';
import { dataHoraBR } from '@/utils/datas';

interface AnotacaoDetalheProps {
  anotacao: Anotacao;
}

// A anotação aberta em /anotacoes/[id]: a data em cima, o texto completo
// embaixo.
export function AnotacaoDetalhe({ anotacao }: AnotacaoDetalheProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.data}>📅 {dataHoraBR(anotacao.criadaEm)}</Text>
      <View style={styles.folha}>
        <Text style={styles.texto} selectable>
          {anotacao.texto}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  data: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  folha: {
    padding: Spacing.lg,
    borderRadius: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  texto: {
    fontSize: 18,
    lineHeight: 27,
    color: Colors.text,
  },
});
