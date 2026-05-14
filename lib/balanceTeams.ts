/**
 * Divisão em times — regras: (1) jovens x veteranos, (2) zagueiros e atacantes.
 */

export type PlayerCategory = 'jovem' | 'veterano';

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

function isZagueiroPosition(position: string): boolean {
  const p = position.trim().toLowerCase();
  return p === 'zag' || p.includes('zagueiro');
}

function isAtacantePosition(position: string): boolean {
  const p = position.trim().toLowerCase();
  return (
    p === 'ata' ||
    p.includes('atacante') ||
    p.includes('centroavante') ||
    p.includes('ponte')
  );
}

/** Separa zagueiros, atacantes e o restante (Gol, laterais, volante, meia…). */
function partitionZagAtaRest<T extends { position: string }>(
  players: T[],
): [T[], T[], T[]] {
  const z: T[] = [];
  const a: T[] = [];
  const r: T[] = [];
  for (const p of players) {
    if (isZagueiroPosition(p.position)) z.push(p);
    else if (isAtacantePosition(p.position)) a.push(p);
    else r.push(p);
  }
  return [z, a, r];
}

/** Round-robin após embaralhar (sem separar por faixa). */
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

/**
 * Distribui jovens e veteranos em round-robin **por faixa**:
 * cada time fica com quantidades o mais iguais possível em cada categoria
 * (ex.: 4 jovens, 2 times → 2 jovens por time).
 */
export function splitPlayersBalancedByYoungVeteran<
  T extends { id: string; category: PlayerCategory },
>(players: T[], numTeams: number, shuffleSeed?: number): T[][] {
  if (numTeams < 1) return [];
  const jovens = players.filter(p => p.category === 'jovem');
  const veter = players.filter(p => p.category === 'veterano');
  shuffleInPlace(jovens, shuffleSeed);
  shuffleInPlace(
    veter,
    shuffleSeed != null ? (shuffleSeed ^ 0x9e3779b9) >>> 0 : undefined,
  );
  const teams: T[][] = Array.from({ length: numTeams }, () => []);
  jovens.forEach((p, i) => {
    teams[i % numTeams]!.push(p);
  });
  veter.forEach((p, i) => {
    teams[i % numTeams]!.push(p);
  });
  return teams;
}

type WithCategory<T> = T & { category: PlayerCategory };

/**
 * Regras (silenciosas, sem persistir faixa no jogador):
 *
 * 1. **Jovens x veteranos**: metade do elenco vira "jovem" e metade "veterano"
 *    (após embaralhar); cada time recebe ~igual em cada faixa.
 * 2. **Zagueiros e atacantes**: dentro de cada faixa, distribui primeiro os
 *    zagueiros em round-robin, depois os atacantes, depois as outras posições.
 */
export function splitPlayersWithHiddenYoungVeteranBalance<
  T extends { id: string; position: string },
>(players: T[], numTeams: number, shuffleSeed?: number): T[][] {
  if (numTeams < 1) return [];
  const arr = [...players];
  shuffleInPlace(arr, shuffleSeed);
  const half = Math.ceil(arr.length / 2);
  const withCat: WithCategory<T>[] = arr.map((p, i) => ({
    ...p,
    category: (i < half ? 'jovem' : 'veterano') as PlayerCategory,
  }));

  const jovens = withCat.filter(p => p.category === 'jovem');
  const veter = withCat.filter(p => p.category === 'veterano');

  shuffleInPlace(jovens, shuffleSeed);
  shuffleInPlace(
    veter,
    shuffleSeed != null ? (shuffleSeed ^ 0x9e3779b9) >>> 0 : undefined,
  );

  const teams: WithCategory<T>[][] = Array.from({ length: numTeams }, () => []);

  const pushBucketRR = (bucket: WithCategory<T>[], startK: number) => {
    let k = startK;
    for (const p of bucket) {
      teams[k % numTeams]!.push(p);
      k++;
    }
    return k;
  };

  // Regra 1 + 2: jovens (Zag → Ata → resto), depois veteranos (Zag → Ata → resto)
  let k = 0;
  const [jZ, jA, jR] = partitionZagAtaRest(jovens);
  k = pushBucketRR(jZ, k);
  k = pushBucketRR(jA, k);
  pushBucketRR(jR, k);

  k = 0;
  const [vZ, vA, vR] = partitionZagAtaRest(veter);
  k = pushBucketRR(vZ, k);
  k = pushBucketRR(vA, k);
  pushBucketRR(vR, k);

  return teams.map(team =>
    team.map(p => {
      const { category: _c, ...rest } = p;
      return rest as unknown as T;
    }),
  );
}
