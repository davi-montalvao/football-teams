/**
 * Algoritmo determinístico para dividir jogadores em times equilibrados.
 *
 * ========== PRIORIDADES ==========
 * PRIORIDADE 1: Balancear posições (cada time com distribuição similar por posição).
 * PRIORIDADE 2: Balancear rating total entre os times.
 *
 * ========== REGRAS ==========
 * 1. Mínimo por time (quando houver jogadores): 1 ZAG, 1 VOL, 1 ATA.
 * 2. Posições com muitos jogadores: distribuir igualmente (ex: 8 ZAG, 2 times → 4 cada).
 * 3. Posições com poucos jogadores: atribuir ao time com menor rating total.
 * 4. Dentro da mesma posição: ordenar por rating e alternar fortes/fracos entre times
 *    (atribuindo sempre ao time com menor total no momento).
 * 5. Determinístico: sem aleatoriedade.
 * 6. Se não for possível equilibrar perfeitamente por posição, priorizar rating total.
 *
 * ========== ALGORITMO PASSO A PASSO ==========
 *
 * 1) Normalizar posições
 *    - Mapear cada rótulo (ex: "Zagueiro", "Zag", "Fixo") para uma posição canônica
 *      (GOL, ZAG, LD, LE, VOL, MEI, ATA).
 *
 * 2) Agrupar jogadores por posição canônica
 *    - Cada jogador entra em exatamente um grupo.
 *
 * 3) Para cada posição, ordenar jogadores por rating decrescente
 *    - Assim, ao atribuir na ordem, o time que está mais fraco recebe o próximo jogador,
 *      o que naturalmente alterna fortes e fracos (ex: ATA 5,5,2,2 → Time A: 5+2, Time B: 5+2).
 *
 * 4) Calcular alvo por time para cada posição
 *    - base = floor(total_da_posição / numTeams)
 *    - resto = total_da_posição % numTeams
 *    - Os primeiros (resto) times recebem base+1; os demais recebem base.
 *    - Ex: 7 zagueiros, 2 times → alvos [4, 3].
 *
 * 5) Distribuir jogadores posição por posição (ordem fixa: GOL, ZAG, LD, LE, VOL, MEI, ATA)
 *    - Para cada jogador (na ordem já ordenada por rating daquela posição):
 *      - Escolher o time que:
 *        (a) ainda está abaixo do alvo dessa posição para esse time;
 *        (b) tem o menor rating total no momento.
 *      - Em empate, usar o menor índice do time (determinístico).
 *    - Atualizar o total de rating do time e o contador da posição nesse time.
 *
 * 6) Resultado: array de times, cada um com jogadores distribuídos de forma
 *    equilibrada por posição e com diferença de rating total minimizada.
 */

export interface BalancePlayer {
  id: string;
  name: string;
  position: string;
  rating?: number;
  stars?: number;
}

/** Posições canônicas para agrupamento (ordem usada na distribuição). */
const POSITION_ORDER = ['GOL', 'ZAG', 'LD', 'LE', 'VOL', 'MEI', 'ATA'] as const;
type CanonicalPosition = (typeof POSITION_ORDER)[number];

/** Mapeia rótulos de posição para posição canônica. */
const POSITION_ALIASES: Record<string, CanonicalPosition> = {
  gol: 'GOL',
  goleiro: 'GOL',
  zag: 'ZAG',
  zagueiro: 'ZAG',
  fixo: 'ZAG',
  'lat d': 'LD',
  'lat e': 'LE',
  'lateral direito': 'LD',
  'lateral esquerdo': 'LE',
  ld: 'LD',
  le: 'LE',
  vol: 'VOL',
  volante: 'VOL',
  mei: 'MEI',
  meia: 'MEI',
  meio: 'MEI',
  ata: 'ATA',
  atacante: 'ATA',
  pivô: 'ATA',
  pivo: 'ATA',
  centroavante: 'ATA',
  ponta: 'ATA',
};

function normalizePosition(position: string): CanonicalPosition {
  const key = position.trim().toLowerCase();
  for (const [alias, canon] of Object.entries(POSITION_ALIASES)) {
    if (key.includes(alias) || key === alias) return canon;
  }
  return 'MEI';
}

function getRating(p: BalancePlayer): number {
  if (p.rating != null) return p.rating;
  if (p.stars != null) return p.stars;
  return 3;
}

/**
 * Calcula quantos jogadores de cada posição cada time deve receber.
 * Ex: 8 zagueiros, 2 times → [4, 4]. 7 zagueiros → [4, 3].
 */
function getTargetsPerTeam(count: number, numTeams: number): number[] {
  const base = Math.floor(count / numTeams);
  const remainder = count % numTeams;
  const targets: number[] = [];
  for (let t = 0; t < numTeams; t++) {
    targets.push(base + (t < remainder ? 1 : 0));
  }
  return targets;
}

/**
 * Divide jogadores em times equilibrados por posição e rating.
 *
 * Passos:
 * 1) Normaliza posições e agrupa jogadores por posição canônica.
 * 2) Para cada posição, ordena por rating (decrescente) para alternar fortes/fracos.
 * 3) Para cada posição, calcula alvo por time (divisão igual + resto).
 * 4) Atribui cada jogador ao time que: (a) ainda está abaixo do alvo dessa posição,
 *    (b) tem o menor rating total (empate: menor índice). Assim minimizamos a diferença
 *    de rating e, dentro da mesma posição, alternamos fortes e fracos.
 * 5) Retorna array de times (cada time = array de jogadores).
 */
export function balanceTeams(
  players: BalancePlayer[],
  numTeams: number,
): BalancePlayer[][] {
  if (numTeams < 1) return [];
  if (players.length === 0) return Array.from({ length: numTeams }, () => []);

  const n = players.length;
  const maxPerTeam = Math.ceil(n / numTeams);

  // 1) Agrupar por posição canônica
  const byPosition = new Map<CanonicalPosition, BalancePlayer[]>();
  for (const pos of POSITION_ORDER) {
    byPosition.set(pos, []);
  }
  for (const p of players) {
    const pos = normalizePosition(p.position);
    if (!byPosition.has(pos)) byPosition.set(pos, []);
    byPosition.get(pos)!.push(p);
  }

  // 2) Ordenar cada grupo por rating decrescente (fortes primeiro)
  for (const list of byPosition.values()) {
    list.sort((a, b) => getRating(b) - getRating(a));
  }

  // 3) Inicializar times e totais de rating por time
  const teams: BalancePlayer[][] = Array.from({ length: numTeams }, () => []);
  const teamTotals: number[] = Array(numTeams).fill(0);
  const teamCountByPosition: number[][] = Array.from({ length: numTeams }, () =>
    Array(POSITION_ORDER.length).fill(0),
  );
  const posToIndex = (pos: CanonicalPosition) =>
    POSITION_ORDER.indexOf(pos);

  // 4) Distribuir posição por posição (ordem fixa)
  for (const pos of POSITION_ORDER) {
    const list = byPosition.get(pos) ?? [];
    if (list.length === 0) continue;

    const targets = getTargetsPerTeam(list.length, numTeams);
    const posIdx = posToIndex(pos);

    for (const player of list) {
      const rating = getRating(player);
      let bestTeam = 0;
      let bestScore = -Infinity;

      for (let t = 0; t < numTeams; t++) {
        // Não ultrapassar tamanho máximo por time (garante 8+8, etc.)
        if (teams[t].length >= maxPerTeam) continue;
        const underTarget =
          teamCountByPosition[t][posIdx] < targets[t];
        const total = teamTotals[t];
        // Priorizar time que está abaixo do alvo desta posição; depois o de menor rating total.
        const score = underTarget ? 1e6 - total : -total;
        if (score > bestScore) {
          bestScore = score;
          bestTeam = t;
        }
      }

      teams[bestTeam].push(player);
      teamTotals[bestTeam] += rating;
      teamCountByPosition[bestTeam][posIdx] += 1;
    }
  }

  return teams;
}
