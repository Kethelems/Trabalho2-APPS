import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

interface TelaDeEsperaProps {
  mensagem: string;
}

// Tela de espera do login/cadastro e da restauração da sessão.
// absoluteFill faz ela cobrir a tela toda, por cima do resto.
export function TelaDeEspera({ mensagem }: TelaDeEsperaProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.mensagem}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  mensagem: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
});
