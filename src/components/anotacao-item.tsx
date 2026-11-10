import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import type { Anotacao } from '@/models/usuario';
import { dataHoraBR } from '@/utils/datas';

interface AnotacaoItemProps {
  anotacao: Anotacao;
}

// Tocar no item abre /anotacoes/[id], passando só o id.
export function AnotacaoItem({ anotacao }: AnotacaoItemProps) {
  return (
    <Link href={{ pathname: '/anotacoes/[id]', params: { id: anotacao.id } }} asChild>
      <Pressable style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
        <Text style={styles.texto} numberOfLines={2}>
          {anotacao.texto}
        </Text>
        <Text style={styles.meta}>{dataHoraBR(anotacao.criadaEm)}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  texto: {
    fontSize: 16,
    color: Colors.text,
  },
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
