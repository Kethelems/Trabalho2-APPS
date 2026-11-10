import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import type { AvisoLogin } from '@/contexts/auth-context';

// O contexto só diz o motivo; o texto fica aqui, junto de quem mostra.
const TEXTOS: Record<AvisoLogin, string> = {
  'sessao-expirada': 'Sua sessão expirou. Entre novamente.',
  'servidor-fora-do-ar':
    'Não deu para conferir sua sessão porque o servidor não respondeu. Tente de novo quando ele estiver no ar.',
};

interface AlertaSessaoProps {
  motivo: AvisoLogin | null;
}

// Faixa amarela no topo do login. Não é erro do formulário (esse é a
// MensagemErro): é um recado sobre a sessão que acabou.
export function AlertaSessao({ motivo }: AlertaSessaoProps) {
  if (!motivo) return null;

  return (
    <View style={styles.faixa}>
      <Text style={styles.icone}>⚠️</Text>
      <Text style={styles.texto}>{TEXTOS[motivo]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  faixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    backgroundColor: Colors.warningSurface,
  },
  icone: {
    fontSize: 16,
  },
  texto: {
    flex: 1,
    fontSize: 14,
    color: Colors.warningText,
  },
});
