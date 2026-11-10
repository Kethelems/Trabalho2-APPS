import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { TelaDeEspera } from '@/components/tela-de-espera';
import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/contexts/auth-context';

// LAYOUT RAIZ — src/app/_layout.tsx
//
// Duas responsabilidades:
//
//   1. Colocar o <AuthProvider> em volta de TODO o app. Como o layout raiz
//      envolve todas as rotas, qualquer tela pode chamar useAuth().
//
//   2. Decidir quais rotas existem de acordo com o usuário logado — é o
//      que <Stack.Protected guard={...}> faz.
//
// Por que dois componentes? Porque quem chama useAuth() precisa estar
// DENTRO do provider. Se RootLayout chamasse useAuth() e renderizasse o
// <AuthProvider> ao mesmo tempo, estaria lendo o canal antes de criá-lo.
export default function RootLayout() {
  return (
    <AuthProvider>
      <RotasDoApp />
    </AuthProvider>
  );
}

function RotasDoApp() {
  const { usuario, carregando, verificandoSessao } = useAuth();
  const logado = usuario !== null;

  // 4.5: só monta as rotas depois de conferir a sessão salva,
  // senão o login aparece por um instante antes de ir pro início
  if (verificandoSessao) {
    return <TelaDeEspera mensagem="Verificando sua sessão…" />;
  }

  // 4.2: a tela de espera fica por cima das rotas, assim o login não é
  // desmontado e o erro continua aparecendo se a senha estiver errada
  return (
    <View style={styles.container}>
      <Pilha logado={logado} />
      {carregando ? <TelaDeEspera mensagem="Conferindo seus dados no servidor…" /> : null}
    </View>
  );
}

function Pilha({ logado }: { logado: boolean }) {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        contentStyle: { backgroundColor: Colors.background },
      }}>
      {/* <Stack.Protected> com guard=false REMOVE as rotas filhas do
          navegador: não dá para chegar nelas nem por link, nem por
          router.push. E se o usuário estiver em uma delas quando o guard
          virar false, o Expo Router o leva sozinho para a primeira rota
          disponível. É isso que faz o login e o logout "navegarem" sem
          nenhum router.replace() nas telas. */}

      {/* Só existe enquanto NÃO há usuário: login e cadastro. */}
      <Stack.Protected guard={!logado}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Só existe COM usuário: o app em si. */}
      <Stack.Protected guard={logado}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Screen name="+not-found" options={{ title: 'Rota não encontrada' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
