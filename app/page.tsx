"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Users, Trophy, Star, Plus, Pencil } from "lucide-react"
import { useIsMobile } from "@/components/ui/use-mobile"
import { useToast } from "@/components/ui/use-toast"

interface Player {
  id: string
  name: string
  position: string
}

interface Team {
  name: string
  players: Player[]
}

interface PredefinedPlayer {
  id: string
  name: string
  defaultPositions: {
    futsal: string[]
    society: string[]
    campo: string[]
  }
}

const positionsByGameType = {
  futsal: ["Goleiro", "Fixo", "Ala D", "Ala E", "Pivô"],
  society: ["Gol", "Zag", "Lat D", "Lat E", "Meio", "Ata"],
  campo: [
    "Goleiro",
    "Zagueiro",
    "Lat D",
    "Lat E",
    "Volante",
    "Meio",
    "Ponte D",
    "Ponte E",
    "Meia A",
    "Centroavante",
  ],
}

const gameTypes = {
  futsal: { name: "Futsal", playersPerTeam: 5 },
  society: { name: "Society", playersPerTeam: 8 },
  campo: { name: "Campo", playersPerTeam: 11 },
}

const getDefaultPositionForGameType = (gameType: keyof typeof gameTypes | ""): string => {
  if (gameType === "futsal") return "Ala D"
  if (gameType === "society") return "Meio"
  if (gameType === "campo") return "Meio"
  return "Meio-campo"
}

const getGoalkeeperPositionLabel = (gameType: keyof typeof gameTypes | ""): string => {
  if (gameType === "society") return "Gol"
  return "Goleiro"
}

const getPositionBadgeClass = (position: string): string => {
  const pos = position.toLowerCase()
  const isGol = pos.includes('gol') || pos.includes('goleiro')
  const base = "text-[9px] sm:text-[10px] leading-none px-1 py-0 max-w-[44px] sm:max-w-[56px] truncate"
  return isGol
    ? `inline-flex bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 text-blue-700 dark:text-blue-300 ${base}`
    : `inline-flex bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 ${base}`
}

// Mapeia nomes para papéis (ata, zag, le, etc.)
const nameRoleOverrides: Record<string, 'ATA' | 'ZAG' | 'LE' | 'LD'> = {
  'Boka': 'ATA',
  'Bruno P': 'ATA',
  'Lopes': 'ZAG',
  'Guiomar': 'ZAG',
  'Jean': 'LE',
  'Davi': 'LE',
  'Lucas': 'ATA',
  'Lukinhas': 'ATA',
  'Wedson': 'ZAG',
  'Peter': 'ATA',
  'Jota': 'ATA',
  'Carlos': 'ZAG',
  'Eduardo': 'ATA',
  'Fabio Sanches': 'ZAG',
  'Guimaraes': 'LE',
  'Leopoldo': 'ZAG',
  'Ley': 'ATA',
  'Marcelinho': 'ATA',
  'Mariano': 'LD',
  'Anisio': 'ZAG',
}

// Converte o papel genérico para a posição por modalidade
const mapRoleToPosition = (gameType: keyof typeof gameTypes | "", role: 'ATA' | 'ZAG' | 'LE' | 'LD'): string => {
  if (role === 'ATA') {
    if (gameType === 'futsal') return 'Pivô'
    if (gameType === 'society') return 'Ata'
    if (gameType === 'campo') return 'Centroavante'
  }
  if (role === 'ZAG') {
    if (gameType === 'futsal') return 'Fixo'
    if (gameType === 'society') return 'Zag'
    if (gameType === 'campo') return 'Zagueiro'
  }
  if (role === 'LE') {
    if (gameType === 'futsal') return 'Ala E'
    if (gameType === 'society') return 'Lat E'
    if (gameType === 'campo') return 'Lat E'
  }
  if (role === 'LD') {
    if (gameType === 'futsal') return 'Ala D'
    if (gameType === 'society') return 'Lat D'
    if (gameType === 'campo') return 'Lat D'
  }
  return getDefaultPositionForGameType(gameType)
}

const stripGloveEmoji = (name: string) => name.replace('🧤','').replace(' 🧤','').trim()

const getPredefinedBasePosition = (displayName: string, gameType: keyof typeof gameTypes | ""): string => {
  const nameNoEmoji = stripGloveEmoji(displayName)
  const isGoalkeeper = displayName.includes('🧤') || nameNoEmoji.toLowerCase() === 'kleber' || nameNoEmoji.toLowerCase() === 'kebler'
  if (isGoalkeeper) return getGoalkeeperPositionLabel(gameType)
  const role = nameRoleOverrides[nameNoEmoji]
  if (role) return mapRoleToPosition(gameType, role)
  return getDefaultPositionForGameType(gameType)
}

  // Lista pré-definida de jogadores (ordem alfabética)
  const initialPredefinedPlayers: PredefinedPlayer[] = [
    "Bruno",
    "Bruno P",
    "Boka",
    "Carlos",
    "Cassio",
    "Davi",
    "Daniel",
    "Anisio",
    "Diógenes",
    "Eduardo",
    "Fabio Sanches",
    "Felipe Augusto",
    "Guiomar",
    "Guimaraes",
    "JP",
    "Jean",
    "Joaquim 🧤",
    "Jota",
    "Kebler 🧤",
    "Klebinho",
    "Leopoldo",
    "Ley",
    "Lopes",
    "Lucas",
    "Lukinhas",
    "Marcelinho",
    "Mariano",
    "Marcio",
    "Miquéias",
    "Peter",
    "Renato R",
    "Ronaldinho",
    "Tagavas",
    "Vinicius",
    "Wedson",
  ].sort((a, b) => a.localeCompare(b)).map((name, index) => ({
    id: String(index + 1),
    name,
    defaultPositions: {
      futsal: positionsByGameType.futsal,
      society: positionsByGameType.society,
      campo: positionsByGameType.campo,
    },
  }))

export default function FootballTeams() {
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [gameType, setGameType] = useState<keyof typeof gameTypes | "">("")
  const [predefined, setPredefined] = useState<PredefinedPlayer[]>(initialPredefinedPlayers)
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    position: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPredefinedPlayers, setSelectedPredefinedPlayers] = useState<string[]>([])
  const [editingPlayer, setEditingPlayer] = useState<{id: string, field: 'name'} | null>(null)
  const [editedPlayers, setEditedPlayers] = useState<{[key: string]: {name?: string, position?: string}}>({})
  const [editingPredefinedPositionId, setEditingPredefinedPositionId] = useState<string | null>(null)

  const isMobile = useIsMobile()
  const { toast } = useToast()
  const teamsSectionRef = useRef<HTMLDivElement | null>(null)

  const addPlayer = () => {
    if (newPlayer.name && newPlayer.position && gameType) {
      const playerId = Date.now().toString()

      // Adiciona à lista de disponíveis
      setPredefined(prev => {
        const next = [
          ...prev,
          {
            id: playerId,
            name: newPlayer.name,
            defaultPositions: {
              futsal: positionsByGameType.futsal,
              society: positionsByGameType.society,
              campo: positionsByGameType.campo,
            },
          },
        ]
        // mantém em ordem alfabética
        return next.sort((a, b) => a.name.localeCompare(b.name))
      })

      // Salva a posição cadastrada para que seja respeitada
      setEditedPlayers(prev => ({
        ...prev,
        [playerId]: {
          position: newPlayer.position
        }
      }))

      setNewPlayer({ name: "", position: "" })
    }
  }

  const removePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id))
  }

  const handleGameTypeChange = (value: keyof typeof gameTypes) => {
    setGameType(value)
    setPlayers([])
    setTeams([])
    setNewPlayer({ name: "", position: "" })
    setSelectedPredefinedPlayers([])
  }

  const addPredefinedPlayers = () => {
    if (!gameType || selectedPredefinedPlayers.length === 0) return

    const newPlayers: Player[] = selectedPredefinedPlayers.map((playerId) => {
      const predefinedPlayer = predefined.find((p) => p.id === playerId)!
      const editedPos = editedPlayers[playerId]?.position
      const finalName = (editedPlayers[playerId]?.name || predefinedPlayer.name)
      const isGoalkeeper = finalName.includes("🧤")
      const overrideRole = nameRoleOverrides[finalName.replace(' 🧤','')] as ('ATA'|'ZAG'|'LE') | undefined
      const overridePos = overrideRole ? mapRoleToPosition(gameType, overrideRole) : undefined
      const chosenPosition = editedPos || (isGoalkeeper ? getGoalkeeperPositionLabel(gameType) : (overridePos || getDefaultPositionForGameType(gameType)))

      // Usar dados editados se existirem, senão usar padrão
      const editedData = editedPlayers[playerId] || {}

      return {
        id: `predefined_${playerId}`,
        name: finalName,
        position: chosenPosition,
      }
    })

    setPlayers([...players, ...newPlayers])
    setSelectedPredefinedPlayers([])
    setEditingPredefinedPositionId(null)
  }

  const buildPlayersFromSelection = (): Player[] => {
    if (!gameType || selectedPredefinedPlayers.length === 0) return []
    return selectedPredefinedPlayers.map((playerId) => {
      const predefinedPlayer = predefined.find((p) => p.id === playerId)!
      const editedPos = editedPlayers[playerId]?.position
      const editedData = editedPlayers[playerId] || {}
      const finalName = editedData.name || predefinedPlayer.name
      const isGoalkeeper = finalName.includes("🧤")
      const overrideRole = nameRoleOverrides[finalName.replace(' 🧤','')] as ('ATA'|'ZAG'|'LE') | undefined
      const overridePos = overrideRole ? mapRoleToPosition(gameType, overrideRole) : undefined
      const chosenPosition = editedPos || (isGoalkeeper ? getGoalkeeperPositionLabel(gameType) : (overridePos || getDefaultPositionForGameType(gameType)))
      return {
        id: `predefined_${playerId}`,
        name: finalName,
        position: chosenPosition,
      }
    })
  }

  const startEditing = (playerId: string, field: 'name') => {
    setEditingPlayer({ id: playerId, field })
  }

  const saveEdit = (playerId: string, value: string) => {
    setEditedPlayers(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [editingPlayer!.field]: value
      }
    }))
    setEditingPlayer(null)
  }

  const cancelEdit = () => {
    setEditingPlayer(null)
  }

  const getEditedValue = (playerId: string, field: 'name', defaultValue: string) => {
    const editedData = editedPlayers[playerId]
    if (editedData && editedData[field] !== undefined) {
      return editedData[field]
    }
    return defaultValue
  }

  const generateTeams = async (sourcePlayers?: Player[]) => {
    if (!gameType) return

    const playersPerTeam = gameTypes[gameType].playersPerTeam
    const totalPlayersNeeded = playersPerTeam * 2

    const pool = (sourcePlayers ?? players)

    if (pool.length < totalPlayersNeeded) {
      toast({
        title: "Jogadores insuficientes",
        description: `Você precisa de pelo menos ${totalPlayersNeeded} jogadores para ${gameTypes[gameType].name}.`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    toast({ title: "Formando Times...", description: "Estamos balanceando as posições." })

    try {
    await new Promise(resolve => setTimeout(resolve, 1500))

      // Balanceamento por posição: goleiro, defesa, meio, ataque (ajustado por modalidade)
      const selected = [...pool].slice(0, totalPlayersNeeded)

      const roleOf = (position: string): 'gol' | 'def' | 'meio' | 'ata' => {
        const p = position.toLowerCase()
        if (p.includes('gol')) return 'gol'
        if (p.includes('goleiro')) return 'gol'
        if (p.includes('zag')) return 'def'
        if (p.includes('zagueiro')) return 'def'
        if (p.includes('lat')) return 'def'
        if (p.includes('lateral')) return 'def'
        if (p.includes('fixo')) return 'def'
        if (p.includes('volante')) return 'meio'
        if (p.includes('meio')) return 'meio'
        if (p.includes('ala')) return 'meio'
        if (p.includes('meia a')) return 'meio'
        if (p.includes('ponta') || p.includes('ponte')) return 'ata'
        if (p.includes('pivô') || p.includes('pivo')) return 'ata'
        if (p.includes('ata')) return 'ata'
        if (p.includes('centroav')) return 'ata'
        return 'meio'
      }

      const groups: Record<'gol' | 'def' | 'meio' | 'ata', Player[]> = { gol: [], def: [], meio: [], ata: [] }
      selected.forEach(player => groups[roleOf(player.position)].push(player))

      Object.values(groups).forEach(arr => arr.sort(() => Math.random() - 0.5))

      const team1: Player[] = []
      const team2: Player[] = []

      // Grupos de separação: evitar que fiquem no mesmo time
      const separationGroups: string[][] = [
        ['Lucas','Lukinhas','JP','Cassio'],
        ['Anisio','Mariano'],
      ]
      const nameInTeam = (t: Player[], name: string) => t.some(p => stripGloveEmoji(p.name).toLowerCase() === stripGloveEmoji(name).toLowerCase())
      const violatesGroup = (t: Player[], candidateName: string) => {
        return separationGroups.some(group => group.includes(stripGloveEmoji(candidateName)) && group.some(member => nameInTeam(t, member)))
      }

      const addToTeams = (player: Player) => {
        const name = stripGloveEmoji(player.name)
        const t1ok = team1.length < playersPerTeam && !violatesGroup(team1, name)
        const t2ok = team2.length < playersPerTeam && !violatesGroup(team2, name)
        if (t1ok && t2ok) {
          // escolhe o menor
          if (team1.length <= team2.length) team1.push(player)
          else team2.push(player)
          return
        }
        if (t1ok) { team1.push(player); return }
        if (t2ok) { team2.push(player); return }
        // Se ambos violam, coloca no menor mesmo assim respeitando capacidade
        if (team1.length < playersPerTeam && team2.length < playersPerTeam) {
          if (team1.length <= team2.length) team1.push(player)
          else team2.push(player)
          return
        }
        if (team1.length < playersPerTeam) { team1.push(player); return }
        if (team2.length < playersPerTeam) { team2.push(player); return }
        // Ambos cheios: ignora quaisquer extras
      }

      const distribute = (arr: Player[]) => {
        arr.forEach((player) => addToTeams(player))
      }

      // garante goleiros equilibrados primeiro, depois demais posições
      distribute(groups.gol)
      distribute(groups.def)
      distribute(groups.meio)
      distribute(groups.ata)

      const built: Team[] = [
        { name: "Time Amarelo", players: team1 },
        { name: "Time Azul", players: team2 },
      ]
      setTeams(built)
      toast({ title: "Times gerados!", description: "Times balanceados por posição com sucesso." })
      setTimeout(() => {
        teamsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } finally {
    setIsLoading(false)
    }
  }

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
                Cadastre jogadores e forme times balanceados automaticamente
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <Card className="bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md border-gray-200/30 dark:border-gray-700/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-gray-100 text-lg sm:text-xl">Escolha a Modalidade</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Primeiro selecione o tipo de jogo para definir as posições disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(gameTypes).map(([key, type]) => (
                <Button
                  key={key}
                  variant={gameType === key ? "default" : "outline"}
                  onClick={() => handleGameTypeChange(key as keyof typeof gameTypes)}
                  className={`h-16 sm:h-20 flex flex-col gap-1 sm:gap-2 transition-all duration-200 ${
                    gameType === key
                      ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg"
                      : "bg-gray-100/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-200 active:bg-gray-200/80 dark:active:bg-gray-700/80"
                  }`}
                >
                  <span className="font-semibold text-sm sm:text-base">{type.name}</span>
                  <span className="text-xs sm:text-sm opacity-80">{type.playersPerTeam} por time</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {gameType && (
          <>
            {/* Jogadores Disponíveis */}
            <Card className="bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md border-gray-200/30 dark:border-gray-700/30 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg sm:text-xl">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  Jogadores Disponíveis
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Selecione os jogadores que vão participar. Clique no nome para editar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {predefined.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                        selectedPredefinedPlayers.includes(player.id)
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      onClick={() => {
                        const needed = gameType ? (gameTypes[gameType].playersPerTeam * 2) : 0
                        const missing = Math.max(0, needed - (players.length + selectedPredefinedPlayers.length))
                        if (selectedPredefinedPlayers.includes(player.id)) {
                          setSelectedPredefinedPlayers(selectedPredefinedPlayers.filter(id => id !== player.id))
                        } else {
                          if (needed > 0 && missing === 0) {
                            toast({
                              title: "Limite atingido",
                              description: "Todos os jogadores necessários já foram selecionados.",
                            })
                            return
                          }
                          setSelectedPredefinedPlayers([...selectedPredefinedPlayers, player.id])
                        }
                      }}
                    >
                      <div className="hidden sm:block">
                      <Checkbox
                        checked={selectedPredefinedPlayers.includes(player.id)}
                        onChange={() => {}}
                        className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      </div>
                      <div className="min-w-0 flex-1">
                        {editingPlayer?.id === player.id && editingPlayer.field === 'name' ? (
                          <Input
                            value={getEditedValue(player.id, 'name', player.name)}
                            onChange={(e) => setEditedPlayers(prev => ({
                              ...prev,
                              [player.id]: { ...prev[player.id], name: e.target.value }
                            }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveEdit(player.id, e.currentTarget.value)
                              } else if (e.key === 'Escape') {
                                cancelEdit()
                              }
                            }}
                            onBlur={() => saveEdit(player.id, getEditedValue(player.id, 'name', player.name))}
                            className="h-6 text-sm p-1"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center justify-between gap-2 w-full">
                          <p
                              className="font-medium text-gray-800 dark:text-gray-100 text-sm overflow-hidden whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-0.5 rounded cursor-text flex-1 min-w-0"
                            onClick={(e) => {
                              e.stopPropagation()
                                if (isMobile) {
                                  const needed = gameType ? (gameTypes[gameType].playersPerTeam * 2) : 0
                                  const missing = Math.max(0, needed - (players.length + selectedPredefinedPlayers.length))
                                  if (selectedPredefinedPlayers.includes(player.id)) {
                                    setSelectedPredefinedPlayers(selectedPredefinedPlayers.filter(id => id !== player.id))
                                  } else {
                                    if (needed > 0 && missing === 0) {
                                      toast({
                                        title: "Limite atingido",
                                        description: "Todos os jogadores necessários já foram selecionados.",
                                      })
                                      return
                                    }
                                    setSelectedPredefinedPlayers([...selectedPredefinedPlayers, player.id])
                                  }
                                } else {
                              startEditing(player.id, 'name')
                                }
                            }}
                            title="Clique para editar o nome"
                          >
                            {getEditedValue(player.id, 'name', player.name)}
                          </p>
                            <div className="flex items-center gap-1">
                              {editingPredefinedPositionId === player.id ? (
                              <Select
                                open={editingPredefinedPositionId === player.id}
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setEditingPredefinedPositionId(null)
                                  }
                                }}
                                value={editedPlayers[player.id]?.position || getPredefinedBasePosition(getEditedValue(player.id, 'name', player.name), gameType)}
                                onValueChange={(value) => {
                                  setEditedPlayers(prev => ({
                              ...prev,
                                    [player.id]: { ...prev[player.id], position: value }
                                  }))
                                  setEditingPredefinedPositionId(null)
                                }}
                              >
                                <SelectTrigger className="h-8 sm:h-6 w-[140px] sm:w-[130px] bg-gray-50/50 dark:bg-gray-800/50 border-gray-200/40 dark:border-gray-600/40 px-2 py-0">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md">
                                  {positionsByGameType[gameType].map((pos) => (
                                    <SelectItem key={pos} value={pos}>
                                      {pos}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              ) : (
                              <Badge
                                variant="secondary"
                                className={getPositionBadgeClass(editedPlayers[player.id]?.position || getPredefinedBasePosition(getEditedValue(player.id, 'name', player.name), gameType))}
                              >
                                <span className="sm:hidden">{(editedPlayers[player.id]?.position || getPredefinedBasePosition(getEditedValue(player.id, 'name', player.name), gameType)).slice(0,3)}</span>
                                <span className="hidden sm:inline">{editedPlayers[player.id]?.position || getPredefinedBasePosition(getEditedValue(player.id, 'name', player.name), gameType)}</span>
                              </Badge>
                              )}
                              <button
                                type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                                  setEditingPredefinedPositionId(prev => prev === player.id ? null : player.id)
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
                      const needed = gameType ? (gameTypes[gameType].playersPerTeam * 2) : 0
                      const current = Math.min(needed, players.length + selectedPredefinedPlayers.length)
                      return (
                        <>
                          <span>{current}/{needed} selecionados</span>
                          <div className="flex-1 mx-3 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                              style={{ width: `${needed > 0 ? (current / needed) * 100 : 0}%` }}
                            />
                          </div>
                        </>
                      )
                    })()}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {(() => {
                      const needed = gameType ? (gameTypes[gameType].playersPerTeam * 2) : 0
                      const missing = Math.max(0, needed - (players.length + selectedPredefinedPlayers.length))
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
                        )
                      }
                      return null
                    })()}
                    {(() => {
                      const needed = gameType ? (gameTypes[gameType].playersPerTeam * 2) : 0
                      const missing = Math.max(0, needed - (players.length + selectedPredefinedPlayers.length))
                      if (needed > 0 && missing === 0) {
                        return (
                          <Button
                            onClick={() => {
                              const newPlayers = buildPlayersFromSelection()
                              const combined = newPlayers.length > 0 ? [...players, ...newPlayers] : players

                              // Validar goleiros antes de limpar seleção
                              const roleOf = (position: string): 'gol' | 'def' | 'meio' | 'ata' => {
                                const p = position.toLowerCase()
                                if (p.includes('gol')) return 'gol'
                                if (p.includes('goleiro')) return 'gol'
                                if (p.includes('zag')) return 'def'
                                if (p.includes('zagueiro')) return 'def'
                                if (p.includes('lat')) return 'def'
                                if (p.includes('lateral')) return 'def'
                                if (p.includes('fixo')) return 'def'
                                if (p.includes('volante')) return 'meio'
                                if (p.includes('meio')) return 'meio'
                                if (p.includes('ala')) return 'meio'
                                if (p.includes('meia a')) return 'meio'
                                if (p.includes('ponta') || p.includes('ponte')) return 'ata'
                                if (p.includes('pivô') || p.includes('pivo')) return 'ata'
                                if (p.includes('ata')) return 'ata'
                                if (p.includes('centroav')) return 'ata'
                                return 'meio'
                              }

                              const goalkeepers = combined.filter(player => roleOf(player.position) === 'gol')
                              if (goalkeepers.length < 2) {
                                toast({
                                  title: "Faltam goleiros",
                                  description: "É necessário ter ao menos 2 goleiros para formar times (1 por time).",
                                  variant: "destructive",
                                })
                                return // Mantém a seleção para o usuário corrigir
                              }

                              // Se passou na validação, então adiciona os jogadores e gera os times
                              if (newPlayers.length > 0) {
                                setPlayers(combined)
                                setSelectedPredefinedPlayers([])
                              }
                              generateTeams(combined)
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
                              "Gerar Times"
                            )}
                  </Button>
                        )
                      }
                      return null
                    })()}

                  {selectedPredefinedPlayers.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPredefinedPlayers([])}
                        className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading || (() => {
                          const needed = gameType ? (gameTypes[gameType].playersPerTeam * 2) : 0
                          const missing = Math.max(0, needed - (players.length + selectedPredefinedPlayers.length))
                          return needed > 0 && missing === 0
                        })()}
                    >
                      Limpar Seleção
                    </Button>
                  )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cadastrar Novo Jogador */}
            <Card className="bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md border-gray-200/30 dark:border-gray-700/30 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg sm:text-xl">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                  Cadastrar Novo Jogador - {gameTypes[gameType].name}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Adicione um jogador personalizado informando nome e posição
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="sm:col-span-2 lg:col-span-2">
                    <Label htmlFor="name" className="text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                      Nome
                    </Label>
                    <Input
                      id="name"
                      value={newPlayer.name}
                      onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                      placeholder="Nome do jogador"
                      className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/40 dark:border-gray-600/40"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-2">
                    <Label htmlFor="position" className="text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                      Posição
                    </Label>
                    <Select
                      value={newPlayer.position}
                      onValueChange={(value) => setNewPlayer({ ...newPlayer, position: value })}
                    >
                      <SelectTrigger className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/40 dark:border-gray-600/40">
                        <SelectValue placeholder="Selecione a posição" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md">
                        {positionsByGameType[gameType].map((pos) => (
                          <SelectItem key={pos} value={pos}>
                            {pos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={addPlayer}
                      className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg active:from-emerald-600 active:to-blue-600 transition-all duration-200 text-sm sm:text-base"
                    >
                      {isMobile ? "Adicionar" : "Adicionar Jogador"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    Calculando o melhor balanceamento para times equilibrados
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
          <div ref={teamsSectionRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {teams.map((team, index) => (
              <Card
                key={index}
                className={`backdrop-blur-md border-2 shadow-xl ${
                  index === 0
                    ? "bg-yellow-50/70 dark:bg-yellow-900/20 border-yellow-300/60 dark:border-yellow-500/40"
                    : "bg-blue-50/70 dark:bg-blue-900/20 border-blue-300/60 dark:border-blue-500/40"
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-gray-800 dark:text-gray-100 text-lg sm:text-xl">
                    <span className="truncate flex items-center gap-2">
                      <span className={`${index === 0 ? 'bg-yellow-400' : 'bg-blue-500'} inline-block w-3 h-3 rounded-full ring-2 ${index === 0 ? 'ring-yellow-200 dark:ring-yellow-700/50' : 'ring-blue-200 dark:ring-blue-700/50'}`}></span>
                      {team.name}
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{team.players.length}/{gameTypes[gameType].playersPerTeam}</span>
                    </span>

                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    {team.players.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 bg-gray-100/40 dark:bg-gray-800/40 backdrop-blur-sm rounded border border-gray-200/30 dark:border-gray-600/30"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5 w-full">
                            <p className="font-medium text-gray-800 dark:text-gray-100 text-sm sm:text-base overflow-hidden whitespace-nowrap flex-1 min-w-0">{player.name}</p>
                                {(() => {
                                  const pos = player.position
                                  const isGol = pos.toLowerCase().includes('gol') || pos.toLowerCase().includes('goleiro')
                                  const base = "text-[9px] sm:text-[10px] leading-none px-1 py-0 max-w-[44px] sm:max-w-[56px] truncate"
                                  const cls = isGol
                                    ? `inline-flex bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 text-blue-700 dark:text-blue-300 ${base}`
                                    : `inline-flex bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 ${base}`
                                  return (
                                    <Badge variant="secondary" className={cls}>
                                      <span className="sm:hidden">{pos.slice(0,3)}</span>
                                      <span className="hidden sm:inline">{pos}</span>
                                    </Badge>
                                  )
                                })()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
