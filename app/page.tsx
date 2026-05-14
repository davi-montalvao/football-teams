'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Users, Trophy, Star, Plus, Pencil } from 'lucide-react';
import { useIsMobile } from '@/components/ui/use-mobile';
import { useToast } from '@/components/ui/use-toast';
import { splitPlayersWithHiddenYoungVeteranBalance } from '@/lib/balanceTeams';

interface Player {
  id: string;
  name: string;
  position: string;
  stars?: number;
}

interface Team {
  name: string;
  players: Player[];
}

/** Posições Society (única modalidade). */
const SOCIETY_POSITIONS = [
  'Gol',
  'Zag',
  'Lat D',
  'Lat E',
  'Volante',
  'Meia',
  'Ata',
] as const;

/**
 * Ordem na tela ao mostrar o time: goleiro, zagueiro, lateral esquerdo,
 * lateral direito, volante, meia, atacantes.
 */
const LINEUP_DISPLAY_ORDER: readonly string[] = [
  'Gol',
  'Zag',
  'Lat E',
  'Lat D',
  'Volante',
  'Meia',
  'Ata',
];

function lineupSortIndex(position: string): number {
  const p = position.trim();
  const i = LINEUP_DISPLAY_ORDER.indexOf(p);
  return i >= 0 ? i : 1_000;
}

/** Ordena jogadores do time para exibição (posição de campo, depois nome). */
function sortPlayersByLineup<T extends { name: string; position: string }>(
  players: T[],
): void {
  players.sort((a, b) => {
    const d = lineupSortIndex(a.position) - lineupSortIndex(b.position);
    if (d !== 0) return d;
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}

type SocietyPosition = (typeof SOCIETY_POSITIONS)[number];

interface PredefinedPlayer {
  id: string;
  name: string;
  stars?: number;
  /** Posição padrão Society (pode ser sobrescrita em `editedPlayers`). */
  defaultPosition: SocietyPosition;
}

const getPositionBadgeClass = (position: string): string => {
  const pos = position.toLowerCase();
  const isGol = pos.includes('gol') || pos.includes('goleiro');
  const base =
    'text-[9px] sm:text-[10px] leading-none px-1 py-0 max-w-[44px] sm:max-w-[56px] truncate';
  return isGol
    ? `inline-flex bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 text-blue-700 dark:text-blue-300 ${base}`
    : `inline-flex bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 ${base}`;
};

const getPlayerStars = (_name: string): number => 3;

/** Jogadores e posições Society (planilha / tela de referência). */
const PREDEFINED_SOCIETY_SEED: { name: string; defaultPosition: SocietyPosition }[] =
  [
    { name: 'Alex', defaultPosition: 'Ata' },
    { name: 'André MM', defaultPosition: 'Ata' },
    { name: 'Anisio', defaultPosition: 'Volante' },
    { name: 'Boka', defaultPosition: 'Ata' },
    { name: 'Bruno P', defaultPosition: 'Meia' },
    { name: 'Carlos', defaultPosition: 'Zag' },
    { name: 'Cassio', defaultPosition: 'Meia' },
    { name: 'Clayton', defaultPosition: 'Meia' },
    { name: 'Daniel', defaultPosition: 'Zag' },
    { name: 'Davi', defaultPosition: 'Lat E' },
    { name: 'Denis', defaultPosition: 'Zag' },
    { name: 'Diógenes', defaultPosition: 'Zag' },
    { name: 'Eduardo', defaultPosition: 'Ata' },
    { name: 'Emerson', defaultPosition: 'Zag' },
    { name: 'Fabio calça', defaultPosition: 'Meia' },
    { name: 'Fabio Sanches', defaultPosition: 'Zag' },
    { name: 'Felipe Augusto', defaultPosition: 'Meia' },
    { name: 'Fernandinho', defaultPosition: 'Lat E' },
    { name: 'Feth', defaultPosition: 'Meia' },
    { name: 'Gaúcho', defaultPosition: 'Ata' },
    { name: 'Gonzales', defaultPosition: 'Zag' },
    { name: 'Guiomar', defaultPosition: 'Zag' },
    { name: 'Gustavo', defaultPosition: 'Ata' },
    { name: 'Henrique', defaultPosition: 'Meia' },
    { name: 'Igor', defaultPosition: 'Meia' },
    { name: 'Jean', defaultPosition: 'Lat E' },
    { name: 'Jhony', defaultPosition: 'Meia' },
    { name: 'Jhow', defaultPosition: 'Meia' },
    { name: 'Joaquim🧤', defaultPosition: 'Gol' },
    { name: 'Jota', defaultPosition: 'Ata' },
    { name: 'JP', defaultPosition: 'Meia' },
    { name: 'Ket', defaultPosition: 'Meia' },
    { name: 'Kleber🧤', defaultPosition: 'Gol' },
    { name: 'Klebinho', defaultPosition: 'Volante' },
    { name: 'Koreia', defaultPosition: 'Meia' },
    { name: 'Leandro Adão', defaultPosition: 'Zag' },
    { name: 'Léo', defaultPosition: 'Zag' },
    { name: 'Leopoldo', defaultPosition: 'Zag' },
    { name: 'Ley', defaultPosition: 'Ata' },
    { name: 'Lopes', defaultPosition: 'Zag' },
    { name: 'Lucas', defaultPosition: 'Ata' },
    { name: 'Lucas Oliv', defaultPosition: 'Ata' },
    { name: 'Lucio', defaultPosition: 'Zag' },
    { name: 'Lukinhas', defaultPosition: 'Ata' },
    { name: 'Magalhães', defaultPosition: 'Lat E' },
    { name: 'Magrelo', defaultPosition: 'Lat D' },
    { name: 'Marcão', defaultPosition: 'Ata' },
    { name: 'Marcelinho', defaultPosition: 'Ata' },
    { name: 'Marcio', defaultPosition: 'Volante' },
    { name: 'Mariano', defaultPosition: 'Lat D' },
    { name: 'Michael', defaultPosition: 'Volante' },
    { name: 'Miquéias', defaultPosition: 'Zag' },
    { name: 'Pacheco', defaultPosition: 'Volante' },
    { name: 'Pedro', defaultPosition: 'Ata' },
    { name: 'Pericles', defaultPosition: 'Ata' },
    { name: 'Peter', defaultPosition: 'Meia' },
    { name: 'Renatão', defaultPosition: 'Zag' },
    { name: 'Renato📹', defaultPosition: 'Meia' },
    { name: 'Ronaldinho', defaultPosition: 'Meia' },
    { name: 'Tagavas', defaultPosition: 'Ata' },
    { name: 'Vinicius', defaultPosition: 'Zag' },
    { name: 'Wedson', defaultPosition: 'Zag' },
    { name: 'Zoio👀', defaultPosition: 'Ata' },
  ];

// Lista pré-definida (ordem alfabética por nome)
const initialPredefinedPlayers: PredefinedPlayer[] = [...PREDEFINED_SOCIETY_SEED]
  .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  .map((row, index) => ({
    id: String(index + 1),
    name: row.name,
    stars: getPlayerStars(row.name),
    defaultPosition: row.defaultPosition,
  }));

const initialEditedPlayers: Record<
  string,
  { name?: string; position?: string }
> = {};

export default function FootballTeams() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [predefined, setPredefined] = useState<PredefinedPlayer[]>(
    initialPredefinedPlayers,
  );
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: '',
    stars: 3,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPredefinedPlayers, setSelectedPredefinedPlayers] = useState<
    string[]
  >([]);
  const [editingPlayer, setEditingPlayer] = useState<{
    id: string;
    field: 'name';
  } | null>(null);
  const [editedPlayers, setEditedPlayers] = useState<
    Record<string, { name?: string; position?: string }>
  >(() => initialEditedPlayers);
  const [editingPredefinedPositionId, setEditingPredefinedPositionId] =
    useState<string | null>(null);

  // Configurações para society
  const [numberOfTeams, setNumberOfTeams] = useState<number>(2);
  const [playersPerTeam, setPlayersPerTeam] = useState<number>(8);
  const [societyConfigured, setSocietyConfigured] = useState<boolean>(false);

  const isMobile = useIsMobile();
  const { toast } = useToast();
  const teamsSectionRef = useRef<HTMLDivElement | null>(null);

  // Função helper para calcular jogadores necessários
  const getTotalPlayersNeeded = () => {
    if (!societyConfigured) return 0;
    return numberOfTeams * playersPerTeam;
  };

  const addPlayer = () => {
    if (newPlayer.name && newPlayer.position) {
      const nameTrimmed = newPlayer.name.trim();
      const normalized = nameTrimmed
        .replace('🧤', '')
        .replace(' 🧤', '')
        .trim()
        .toLowerCase();

      // Verifica duplicatas na lista pré-definida e nos jogadores já adicionados
      const existsInPredefined = predefined.some(
        p =>
          p.name.replace('🧤', '').replace(' 🧤', '').trim().toLowerCase() ===
          normalized,
      );
      const existsInPlayers = players.some(
        p =>
          p.name.replace('🧤', '').replace(' 🧤', '').trim().toLowerCase() ===
          normalized,
      );
      if (existsInPredefined || existsInPlayers) {
        toast({
          title: 'Nome já existe',
          description: `O jogador "${nameTrimmed}" já está cadastrado. Escolha outro nome.`,
          variant: 'destructive',
        });
        return;
      }

      const playerId = Date.now().toString();

      // Adiciona à lista de disponíveis
      setPredefined(prev => {
        const next = [
          ...prev,
          {
            id: playerId,
            name: nameTrimmed,
            stars: newPlayer.stars,
            defaultPosition: newPlayer.position as SocietyPosition,
          },
        ];
        return next.sort((a, b) => a.name.localeCompare(b.name));
      });

      // Salva a posição cadastrada
      setEditedPlayers(prev => ({
        ...prev,
        [playerId]: {
          position: newPlayer.position,
        },
      }));

      // Se houver vagas necessárias, já seleciona o jogador recém-criado
      setSelectedPredefinedPlayers(prev => {
        try {
          const needed = getTotalPlayersNeeded();
          const missing = Math.max(0, needed - (players.length + prev.length));
          if (missing > 0) {
            return [...prev, playerId];
          }
        } catch (e) {
          // em caso de qualquer erro, não trava a UI
        }
        return prev;
      });

      setNewPlayer({ name: '', position: '', stars: 3 });
    }
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const addPredefinedPlayers = () => {
    if (!societyConfigured || selectedPredefinedPlayers.length === 0) return;

    const newPlayers: Player[] = selectedPredefinedPlayers.map(playerId => {
      const predefinedPlayer = predefined.find(p => p.id === playerId)!;
      const finalName = editedPlayers[playerId]?.name || predefinedPlayer.name;
      const chosenPosition =
        editedPlayers[playerId]?.position ?? predefinedPlayer.defaultPosition;

      return {
        id: `predefined_${playerId}`,
        name: finalName,
        position: chosenPosition,
        stars: predefinedPlayer.stars ?? getPlayerStars(finalName),
      };
    });

    setPlayers([...players, ...newPlayers]);
    setSelectedPredefinedPlayers([]);
    setEditingPredefinedPositionId(null);
  };

  const buildPlayersFromSelection = (): Player[] => {
    if (!societyConfigured || selectedPredefinedPlayers.length === 0) return [];
    return selectedPredefinedPlayers.map(playerId => {
      const predefinedPlayer = predefined.find(p => p.id === playerId)!;
      const editedData = editedPlayers[playerId] || {};
      const finalName = editedData.name || predefinedPlayer.name;
      const chosenPosition =
        editedData.position ?? predefinedPlayer.defaultPosition;
      return {
        id: `predefined_${playerId}`,
        name: finalName,
        position: chosenPosition,
        stars: predefinedPlayer.stars ?? getPlayerStars(finalName),
      };
    });
  };

  const startEditing = (playerId: string, field: 'name') => {
    setEditingPlayer({ id: playerId, field });
  };

  const saveEdit = (playerId: string, value: string) => {
    setEditedPlayers(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [editingPlayer!.field]: value,
      },
    }));
    setEditingPlayer(null);
  };

  const cancelEdit = () => {
    setEditingPlayer(null);
  };

  const getEditedValue = (
    playerId: string,
    field: 'name',
    defaultValue: string,
  ) => {
    const editedData = editedPlayers[playerId];
    if (editedData && editedData[field] !== undefined) {
      return editedData[field];
    }
    return defaultValue;
  };

  const generateTeams = async (
    sourcePlayers?: Player[],
    opts?: { reshuffle?: boolean },
  ) => {
    if (!societyConfigured) return;

    const currentPlayersPerTeam = playersPerTeam;
    const currentNumberOfTeams = numberOfTeams;
    const totalPlayersNeeded = currentPlayersPerTeam * currentNumberOfTeams;

    const pool = sourcePlayers ?? players;

    if (pool.length < totalPlayersNeeded) {
      toast({
        title: 'Jogadores insuficientes',
        description: `Você precisa de pelo menos ${totalPlayersNeeded} jogadores para Society.`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    toast({
      title: 'Formando Times...',
      description: 'Distribuindo jogadores de forma equilibrada.',
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const selected = [...pool].slice(0, totalPlayersNeeded);

      const shuffleSeed = opts?.reshuffle
        ? (Date.now() ^ (performance.now() * 1_000_000 | 0)) >>> 0
        : undefined;

      const teams = splitPlayersWithHiddenYoungVeteranBalance(
        selected,
        currentNumberOfTeams,
        shuffleSeed,
      );

      for (const team of teams) {
        sortPlayersByLineup(team);
      }

      // Nomes dos times
      const teamNames = [
        'Time Amarelo',
        'Time Azul',
        'Time Verde',
        'Time Vermelho',
        'Time Roxo',
        'Time Laranja',
        'Time Rosa',
        'Time Marrom',
      ];

      const built: Team[] = teams.map((teamPlayers, index) => ({
        name: teamNames[index] || `Time ${index + 1}`,
        players: teamPlayers,
      }));
      setTeams(built);
      toast({
        title: 'Times gerados!',
        description: opts?.reshuffle
          ? 'Nova ordem dos times.'
          : 'Times formados.',
      });
      setTimeout(() => {
        teamsSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 50);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-blue-100 to-purple-100 dark:from-emerald-950/20 dark:via-blue-950/20 dark:to-purple-950/20">
      {/* Header */}
      <header className="bg-gray-50/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/30">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-transparent bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent leading-tight">
                Formador de Times
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mt-1 sm:mt-2">
                Cadastre jogadores e forme times automaticamente
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <>
            {/* Configuração Society */}
            {!societyConfigured && (
              <Card className="bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md border-gray-200/30 dark:border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-gray-800 dark:text-gray-100 text-lg sm:text-xl">
                    Configurar Society
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    Configure quantos times e quantos jogadores por time você
                    deseja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="numberOfTeams"
                        className="text-gray-700 dark:text-gray-200 text-sm sm:text-base"
                      >
                        Número de Times
                      </Label>
                      <Select
                        value={numberOfTeams.toString()}
                        onValueChange={value =>
                          setNumberOfTeams(parseInt(value))
                        }
                      >
                        <SelectTrigger className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/40 dark:border-gray-600/40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md">
                          {[2, 3, 4, 5, 6].map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} times
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="playersPerTeam"
                        className="text-gray-700 dark:text-gray-200 text-sm sm:text-base"
                      >
                        Jogadores por Time
                      </Label>
                      <Select
                        value={playersPerTeam.toString()}
                        onValueChange={value =>
                          setPlayersPerTeam(parseInt(value))
                        }
                      >
                        <SelectTrigger className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/40 dark:border-gray-600/40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md">
                          {[5, 6, 7, 8, 9, 10, 11].map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} jogadores
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/40 dark:border-blue-700/40">
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Total de jogadores necessários:{' '}
                        {numberOfTeams * playersPerTeam}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-300">
                        {numberOfTeams} times × {playersPerTeam} jogadores cada
                      </p>
                    </div>
                    <Button
                      onClick={() => setSocietyConfigured(true)}
                      className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg active:from-emerald-600 active:to-blue-600 transition-all duration-200"
                    >
                      Confirmar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Jogadores Disponíveis */}
            {societyConfigured && (
              <Card className="bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md border-gray-200/30 dark:border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg sm:text-xl">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                    Jogadores Disponíveis
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    Selecione os jogadores que vão participar. Clique no nome
                    para editar; a posição pode ser ajustada ao lado.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {predefined.map(player => (
                      <div
                        key={player.id}
                        className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                          selectedPredefinedPlayers.includes(player.id)
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => {
                          const needed = getTotalPlayersNeeded();
                          const missing = Math.max(
                            0,
                            needed -
                              (players.length +
                                selectedPredefinedPlayers.length),
                          );
                          if (selectedPredefinedPlayers.includes(player.id)) {
                            setSelectedPredefinedPlayers(
                              selectedPredefinedPlayers.filter(
                                id => id !== player.id,
                              ),
                            );
                          } else {
                            if (needed > 0 && missing === 0) {
                              toast({
                                title: 'Limite atingido',
                                description:
                                  'Todos os jogadores necessários já foram selecionados.',
                              });
                              return;
                            }
                            setSelectedPredefinedPlayers([
                              ...selectedPredefinedPlayers,
                              player.id,
                            ]);
                          }
                        }}
                      >
                        <div className="hidden sm:block">
                          <Checkbox
                            checked={selectedPredefinedPlayers.includes(
                              player.id,
                            )}
                            onChange={() => {}}
                            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          {editingPlayer?.id === player.id &&
                          editingPlayer.field === 'name' ? (
                            <Input
                              value={getEditedValue(
                                player.id,
                                'name',
                                player.name,
                              )}
                              onChange={e =>
                                setEditedPlayers(prev => ({
                                  ...prev,
                                  [player.id]: {
                                    ...prev[player.id],
                                    name: e.target.value,
                                  },
                                }))
                              }
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  saveEdit(player.id, e.currentTarget.value);
                                } else if (e.key === 'Escape') {
                                  cancelEdit();
                                }
                              }}
                              onBlur={() =>
                                saveEdit(
                                  player.id,
                                  getEditedValue(
                                    player.id,
                                    'name',
                                    player.name,
                                  ),
                                )
                              }
                              className="h-6 text-sm p-1"
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center justify-between gap-2 w-full">
                              <p
                                className="font-medium text-gray-800 dark:text-gray-100 text-sm overflow-hidden whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-0.5 rounded cursor-text flex-1 min-w-0"
                                onClick={e => {
                                  e.stopPropagation();
                                  if (isMobile) {
                                    const needed = getTotalPlayersNeeded();
                                    const missing = Math.max(
                                      0,
                                      needed -
                                        (players.length +
                                          selectedPredefinedPlayers.length),
                                    );
                                    if (
                                      selectedPredefinedPlayers.includes(
                                        player.id,
                                      )
                                    ) {
                                      setSelectedPredefinedPlayers(
                                        selectedPredefinedPlayers.filter(
                                          id => id !== player.id,
                                        ),
                                      );
                                    } else {
                                      if (needed > 0 && missing === 0) {
                                        toast({
                                          title: 'Limite atingido',
                                          description:
                                            'Todos os jogadores necessários já foram selecionados.',
                                        });
                                        return;
                                      }
                                      setSelectedPredefinedPlayers([
                                        ...selectedPredefinedPlayers,
                                        player.id,
                                      ]);
                                    }
                                  } else {
                                    startEditing(player.id, 'name');
                                  }
                                }}
                                title="Clique para editar o nome"
                              >
                                {getEditedValue(player.id, 'name', player.name)}
                              </p>
                              <div className="flex items-center gap-1">
                                {editingPredefinedPositionId === player.id ? (
                                  <Select
                                    open={
                                      editingPredefinedPositionId === player.id
                                    }
                                    onOpenChange={open => {
                                      if (!open) {
                                        setEditingPredefinedPositionId(null);
                                      }
                                    }}
                                    value={
                                      editedPlayers[player.id]?.position ??
                                      player.defaultPosition
                                    }
                                    onValueChange={value => {
                                      setEditedPlayers(prev => ({
                                        ...prev,
                                        [player.id]: {
                                          ...prev[player.id],
                                          position: value,
                                        },
                                      }));
                                      setEditingPredefinedPositionId(null);
                                    }}
                                  >
                                    <SelectTrigger className="h-8 sm:h-6 w-[140px] sm:w-[130px] bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/40 dark:border-gray-600/40 px-2 py-0">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md">
                                      {SOCIETY_POSITIONS.map(pos => (
                                          <SelectItem key={pos} value={pos}>
                                            {pos}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className={getPositionBadgeClass(
                                      editedPlayers[player.id]?.position ??
                                        player.defaultPosition,
                                    )}
                                  >
                                    <span className="sm:hidden">
                                      {(
                                        editedPlayers[player.id]?.position ??
                                        player.defaultPosition
                                      ).slice(0, 3)}
                                    </span>
                                    <span className="hidden sm:inline">
                                      {editedPlayers[player.id]?.position ??
                                        player.defaultPosition}
                                    </span>
                                  </Badge>
                                )}
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setEditingPredefinedPositionId(prev =>
                                      prev === player.id ? null : player.id,
                                    );
                                  }}
                                  className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                  title="Editar posição"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Rodapé fixo no mobile: progresso + ações */}
                  <div className="sm:static sticky bottom-0 left-0 right-0 z-10 -mx-4 px-4 py-2 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur supports-[backdrop-filter]:bg-gray-50/70 border-t border-gray-200/40 dark:border-gray-700/40 space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      {(() => {
                        const needed = getTotalPlayersNeeded();
                        const current = Math.min(
                          needed,
                          players.length + selectedPredefinedPlayers.length,
                        );
                        return (
                          <>
                            <span>
                              {current}/{needed} selecionados
                            </span>
                            <div className="flex-1 mx-3 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                                style={{
                                  width: `${needed > 0 ? (current / needed) * 100 : 0}%`,
                                }}
                              />
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {(() => {
                        const needed = getTotalPlayersNeeded();
                        const missing = Math.max(
                          0,
                          needed -
                            (players.length + selectedPredefinedPlayers.length),
                        );
                        if (needed > 0 && missing > 0) {
                          return (
                            <Button
                              onClick={addPredefinedPlayers}
                              disabled={selectedPredefinedPlayers.length === 0}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg active:from-yellow-600 active:to-orange-600 transition-all duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Star className="h-4 w-4 mr-2" />
                              {`Faltam ${missing} jogador${missing !== 1 ? 'es' : ''}`}
                            </Button>
                          );
                        }
                        return null;
                      })()}
                      {(() => {
                        const needed = getTotalPlayersNeeded();
                        const missing = Math.max(
                          0,
                          needed -
                            (players.length + selectedPredefinedPlayers.length),
                        );
                        if (needed > 0 && missing === 0) {
                          return (
                            <Button
                              onClick={() => {
                                const newPlayers = buildPlayersFromSelection();
                                const combined =
                                  newPlayers.length > 0
                                    ? [...players, ...newPlayers]
                                    : players;

                                // Se passou na validação, então adiciona os jogadores e gera os times
                                if (newPlayers.length > 0) {
                                  setPlayers(combined);
                                  setSelectedPredefinedPlayers([]);
                                }
                                generateTeams(combined);
                              }}
                              disabled={isLoading}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg active:from-purple-600 active:to-pink-600 transition-all duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 w-5 h-5 border-2 border-white/30 rounded-full"></div>
                                  </div>
                                  <span>Formando Times...</span>
                                </div>
                              ) : (
                                'Gerar Times'
                              )}
                            </Button>
                          );
                        }
                        return null;
                      })()}

                      {selectedPredefinedPlayers.length > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => setSelectedPredefinedPlayers([])}
                          className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={
                            isLoading ||
                            (() => {
                              const needed = getTotalPlayersNeeded();
                              const missing = Math.max(
                                0,
                                needed -
                                  (players.length +
                                    selectedPredefinedPlayers.length),
                              );
                              return needed > 0 && missing === 0;
                            })()
                          }
                        >
                          Limpar Seleção
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cadastrar Novo Jogador */}
            {societyConfigured && (
              <Card className="bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md border-gray-200/30 dark:border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg sm:text-xl">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                    Cadastrar Novo Jogador - Society (
                    {numberOfTeams} times, {playersPerTeam} jogadores cada)
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    Informe nome, posição e nível (1 a 5 estrelas).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="sm:col-span-2 lg:col-span-2">
                      <Label
                        htmlFor="name"
                        className="text-gray-700 dark:text-gray-200 text-sm sm:text-base"
                      >
                        Nome
                      </Label>
                      <Input
                        id="name"
                        value={newPlayer.name}
                        onChange={e =>
                          setNewPlayer({ ...newPlayer, name: e.target.value })
                        }
                        placeholder="Nome do jogador"
                        className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/40 dark:border-gray-600/40"
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-2">
                      <Label
                        htmlFor="position"
                        className="text-gray-700 dark:text-gray-200 text-sm sm:text-base"
                      >
                        Posição
                      </Label>
                      <Select
                        value={newPlayer.position}
                        onValueChange={value =>
                          setNewPlayer({ ...newPlayer, position: value })
                        }
                      >
                        <SelectTrigger className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/40 dark:border-gray-600/40">
                          <SelectValue placeholder="Selecione a posição" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md">
                          {SOCIETY_POSITIONS.map(pos => (
                            <SelectItem key={pos} value={pos}>
                              {pos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                      <Label
                        htmlFor="stars"
                        className="text-gray-700 dark:text-gray-200 text-sm sm:text-base"
                      >
                        Estrelas (1–5)
                      </Label>
                      <Select
                        value={String(newPlayer.stars)}
                        onValueChange={value =>
                          setNewPlayer({
                            ...newPlayer,
                            stars: Math.min(
                              5,
                              Math.max(1, parseInt(value, 10) || 3),
                            ),
                          })
                        }
                      >
                        <SelectTrigger
                          id="stars"
                          className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/40 dark:border-gray-600/40"
                        >
                          <SelectValue placeholder="Estrelas" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md">
                          {[1, 2, 3, 4, 5].map(n => (
                            <SelectItem key={n} value={String(n)}>
                              {n} estrela{n === 1 ? '' : 's'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end sm:col-span-2 lg:col-span-1">
                      <Button
                        onClick={addPlayer}
                        className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg active:from-emerald-600 active:to-blue-600 transition-all duration-200 text-sm sm:text-base"
                      >
                        {isMobile ? 'Adicionar' : 'Adicionar Jogador'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Removido Jogadores Cadastrados: fluxo passa por Disponíveis */}

            {/* Loading com Bola de Futebol */}
            {isLoading && (
              <Card className="bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md border-gray-200/30 dark:border-gray-700/30 shadow-xl">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      {/* Bola de futebol animada */}
                      <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center relative overflow-hidden">
                        {/* Padrões da bola */}
                        <div className="absolute inset-0 bg-white/20 rounded-full transform rotate-45 scale-75"></div>
                        <div className="absolute inset-0 bg-white/10 rounded-full transform -rotate-45 scale-75"></div>
                        <div className="absolute inset-0 bg-white/15 rounded-full transform rotate-90 scale-50"></div>
                        <div className="absolute inset-0 bg-white/10 rounded-full transform -rotate-90 scale-50"></div>

                        {/* Centro da bola */}
                        <div className="w-4 h-4 bg-white/30 rounded-full"></div>
                      </div>

                      {/* Efeito de brilho */}
                      <div className="absolute -top-1 -left-1 w-4 h-4 bg-white/40 rounded-full animate-pulse"></div>
                    </div>

                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        Formando Times...
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Montando a lista de times...
                      </p>
                    </div>

                    {/* Barra de progresso animada */}
                    <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Times Gerados */}
            {teams.length > 0 && !isLoading && (
              <div className="flex items-center justify-center sm:justify-end mb-2">
                <Button
                  variant="outline"
                  onClick={() => generateTeams(players, { reshuffle: true })}
                  disabled={isLoading}
                  className="text-sm"
                >
                  Gerar novamente
                </Button>
              </div>
            )}
            {teams.length > 0 && !isLoading && (
              <div
                ref={teamsSectionRef}
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
              >
                {teams.map((team, index) => {
                  const teamColors = [
                    {
                      bg: 'bg-yellow-50/70 dark:bg-yellow-900/20',
                      border: 'border-yellow-300/60 dark:border-yellow-500/40',
                      badge: 'bg-yellow-400',
                      ring: 'ring-yellow-200 dark:ring-yellow-700/50',
                    },
                    {
                      bg: 'bg-blue-50/70 dark:bg-blue-900/20',
                      border: 'border-blue-300/60 dark:border-blue-500/40',
                      badge: 'bg-blue-500',
                      ring: 'ring-blue-200 dark:ring-blue-700/50',
                    },
                    {
                      bg: 'bg-green-50/70 dark:bg-green-900/20',
                      border: 'border-green-300/60 dark:border-green-500/40',
                      badge: 'bg-green-500',
                      ring: 'ring-green-200 dark:ring-green-700/50',
                    },
                    {
                      bg: 'bg-red-50/70 dark:bg-red-900/20',
                      border: 'border-red-300/60 dark:border-red-500/40',
                      badge: 'bg-red-500',
                      ring: 'ring-red-200 dark:ring-red-700/50',
                    },
                    {
                      bg: 'bg-purple-50/70 dark:bg-purple-900/20',
                      border: 'border-purple-300/60 dark:border-purple-500/40',
                      badge: 'bg-purple-500',
                      ring: 'ring-purple-200 dark:ring-purple-700/50',
                    },
                    {
                      bg: 'bg-orange-50/70 dark:bg-orange-900/20',
                      border: 'border-orange-300/60 dark:border-orange-500/40',
                      badge: 'bg-orange-500',
                      ring: 'ring-orange-200 dark:ring-orange-700/50',
                    },
                  ];
                  const colors = teamColors[index % teamColors.length];

                  return (
                    <Card
                      key={index}
                      className={`backdrop-blur-md border-2 shadow-xl ${colors.bg} ${colors.border}`}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-gray-800 dark:text-gray-100 text-lg sm:text-xl">
                          <span className="truncate flex items-center gap-2">
                            <span
                              className={`${colors.badge} inline-block w-3 h-3 rounded-full ring-2 ${colors.ring}`}
                            ></span>
                            {team.name}
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                              {team.players.length}/{playersPerTeam}
                            </span>
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 sm:space-y-3">
                          {team.players.map(player => (
                            <div
                              key={player.id}
                              className="flex items-center justify-between p-2 bg-gray-100/40 dark:bg-gray-800/40 backdrop-blur-sm rounded border border-gray-200/30 dark:border-gray-600/30"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1.5 w-full">
                                  <p className="font-medium text-gray-800 dark:text-gray-100 text-sm sm:text-base overflow-hidden whitespace-nowrap flex-1 min-w-0">
                                    {player.name}
                                  </p>
                                  {(() => {
                                    const pos = player.position;
                                    const isGol =
                                      pos.toLowerCase().includes('gol') ||
                                      pos.toLowerCase().includes('goleiro');
                                    const base =
                                      'text-[9px] sm:text-[10px] leading-none px-1 py-0 max-w-[44px] sm:max-w-[56px] truncate';
                                    const cls = isGol
                                      ? `inline-flex bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 text-blue-700 dark:text-blue-300 ${base}`
                                      : `inline-flex bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 ${base}`;
                                    return (
                                      <Badge
                                        variant="secondary"
                                        className={cls}
                                      >
                                        <span className="sm:hidden">
                                          {pos.slice(0, 3)}
                                        </span>
                                        <span className="hidden sm:inline">
                                          {pos}
                                        </span>
                                      </Badge>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
        </>
      </div>
    </div>
  );
}
