// Formatos de data usados nas telas. Os formatadores são criados uma vez só
// e reaproveitados.
const formatoDia = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const formatoHora = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
});

// ISO do servidor -> "29/09/2026 às 14:32", no fuso do aparelho
export function dataHoraBR(iso: string): string {
  const data = new Date(iso);
  return `${formatoDia.format(data)} às ${formatoHora.format(data)}`;
}
