/**
 * Montagem de times:
 * 1) Veterano × Jovem (round-robin em cada grupo, veteranos primeiro depois jovens).
 * 2) Dentro de cada grupo: Gol → Zag → Lat E → Lat D → Volante → Meia → Ata (demais no fim).
 */

export type PlayerGeneration = 'Jovem' | 'Veterano';

function shuffleInPlace<T>(arr: T[], seed: number | undefined): void {
  if (seed == null || arr.length < 2) return;
  let s = seed >>> 0;
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const a = arr[i]!;
    const b = arr[j]!;
    arr[i] = b;
    arr[j] = a;
  }
}

/** Ordem de posição na 2ª regra (dentro de cada faixa etária). */
const POSITION_SPLIT_ORDER = [
  'Gol',
  'Zag',
  'Lat E',
  'Lat D',
  'Volante',
  'Meia',
  'Ata',
] as const;

function normalizeGeneration(gen?: string): PlayerGeneration {
  const g = (gen ?? '').trim().toLowerCase();
  return g === 'jovem' ? 'Jovem' : 'Veterano';
}

function positionBucketIndex(position: string): number | null {
  const p = position.trim();
  const i = (POSITION_SPLIT_ORDER as readonly string[]).indexOf(p);
  return i >= 0 ? i : null;
}

/** Buckets na ordem Gol … Ata; último bucket = outras posições. */
function partitionByPositionOrder<T extends { position: string }>(
  players: T[],
): T[][] {
  const buckets: T[][] = POSITION_SPLIT_ORDER.map(() => []);
  const rest: T[] = [];
  for (const p of players) {
    const idx = positionBucketIndex(p.position);
    if (idx != null) buckets[idx]!.push(p);
    else rest.push(p);
  }
  return [...buckets, rest];
}

type WithGeneration<T> = T & { generation: PlayerGeneration };

/**
 * 1ª regra: separar **Veterano** e **Jovem**, embaralhar cada lista.
 * 2ª regra: em cada lista, distribuir por posição (Gol → … → Ata → resto) em round-robin.
 *
 * Ordem dos grupos no time: **primeiro todos os veteranos** (com a regra de posição),
 * depois **todos os jovens** (idem) — assim os jovens ficam equilibrados entre os times
 * (ex.: 4 jovens, 2 times → 2 por time).
 *
 * O campo `generation` é removido do retorno.
 */
export function splitTeamsByVeteranJovemThenPosition<
  T extends { id: string; position: string; generation?: string },
>(players: T[], numTeams: number, shuffleSeed?: number): T[][] {
  if (numTeams < 1) return [];

  const withGen: WithGeneration<T>[] = players.map(p => ({
    ...p,
    generation: normalizeGeneration(p.generation),
  }));

  const jovens = withGen.filter(p => p.generation === 'Jovem');
  const veter = withGen.filter(p => p.generation === 'Veterano');

  shuffleInPlace(veter, shuffleSeed);
  shuffleInPlace(
    jovens,
    shuffleSeed != null ? (shuffleSeed ^ 0x9e3779b9) >>> 0 : undefined,
  );

  const teams: WithGeneration<T>[][] = Array.from({ length: numTeams }, () => []);

  const pushGroupBucketsRR = (group: WithGeneration<T>[], startK: number) => {
    const buckets = partitionByPositionOrder(group);
    let k = startK;
    for (const bucket of buckets) {
      for (const p of bucket) {
        teams[k % numTeams]!.push(p);
        k++;
      }
    }
    return k;
  };

  let k = 0;
  k = pushGroupBucketsRR(veter, k);
  pushGroupBucketsRR(jovens, k);

  return teams.map(team =>
    team.map(p => {
      const { generation: _g, ...rest } = p;
      return rest as unknown as T;
    }),
  );
}

/** Divisão simples (sem regras de faixa/posição): shuffle + round-robin. */
export function splitPlayersIntoTeams<T extends { id: string }>(
  players: T[],
  numTeams: number,
  shuffleSeed?: number,
): T[][] {
  if (numTeams < 1) return [];
  const arr = [...players];
  shuffleInPlace(arr, shuffleSeed);
  const teams: T[][] = Array.from({ length: numTeams }, () => []);
  arr.forEach((p, i) => {
    teams[i % numTeams]!.push(p);
  });
  return teams;
}
