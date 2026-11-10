import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import type { AnotacaoComAutor } from '@/models/usuario';
import { dataHoraBR } from '@/utils/datas';

interface AnotacaoModeracaoItemProps {
  anotacao: AnotacaoComAutor;
  // true quando quem está moderando é o autor
  doUsuarioAtual: boolean;
}

// Uma linha da moderação: quem escreveu e quando, e o texto embaixo.
export function AnotacaoModeracaoItem({ anotacao, doUsuarioAtual }: AnotacaoModeracaoItemProps) {
  return (
    <View style={styles.item}>
      <View style={styles.topo}>
        <Text style={styles.autor} numberOfLines={1}>
          {anotacao.autorNome}
        </Text>
        {doUsuarioAtual ? <Text style={styles.etiqueta}>sua</Text> : null}
        <Text style={styles.data}>{dataHoraBR(anotacao.criadaEm)}</Text>
      </View>
      <Text style={styles.texto}>{anotacao.texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  autor: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  etiqueta: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: Colors.primary,
  },
  data: {
    marginLeft: 'auto',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  texto: {
    fontSize: 15,
    lineHeight: 21,
    color: Colors.text,
  },
});
