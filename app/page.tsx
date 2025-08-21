"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Users, Trophy, Plus, Loader2, Star } from "lucide-react"
import { useIsMobile } from "@/components/ui/use-mobile"

interface Player {
  id: string
  name: string
  position: string
  skill: number
}

interface Team {
  name: string
  players: Player[]
  averageSkill: number
}

interface PredefinedPlayer {
  id: string
  name: string
  defaultPositions: {
    futsal: string[]
    society: string[]
    campo: string[]
  }
  defaultSkill: number
}

const positionsByGameType = {
  futsal: ["Goleiro", "Fixo", "Ala Direito", "Ala Esquerdo", "Pivô"],
  society: ["Goleiro", "Zagueiro", "Lateral Direito", "Lateral Esquerdo", "Meio-campo", "Atacante"],
  campo: [
    "Goleiro",
    "Zagueiro",
    "Lateral Direito",
    "Lateral Esquerdo",
    "Volante",
    "Meio-campo",
    "Ponta Direita",
    "Ponta Esquerda",
    "Meia-atacante",
    "Centroavante",
  ],
}

const gameTypes = {
  futsal: { name: "Futsal", playersPerTeam: 5 },
  society: { name: "Society", playersPerTeam: 7 },
  campo: { name: "Campo", playersPerTeam: 11 },
}

  // Lista pré-definida de jogadores (em ordem alfabética)
  const predefinedPlayers: PredefinedPlayer[] = [
    { id: "4", name: "Alex", defaultPositions: { futsal: ["Fixo", "Ala Direito"], society: ["Zagueiro", "Meio-campo"], campo: ["Zagueiro", "Volante"] }, defaultSkill: 5 },
    { id: "18", name: "Anderson", defaultPositions: { futsal: ["Goleiro", "Fixo"], society: ["Goleiro", "Zagueiro"], campo: ["Goleiro", "Zagueiro"] }, defaultSkill: 5 },
    { id: "22", name: "André", defaultPositions: { futsal: ["Fixo", "Goleiro"], society: ["Zagueiro", "Goleiro"], campo: ["Zagueiro", "Goleiro"] }, defaultSkill: 5 },
    { id: "12", name: "Daniel", defaultPositions: { futsal: ["Ala Direito", "Pivô"], society: ["Lateral Direito", "Atacante"], campo: ["Lateral Direito", "Ponta Direita"] }, defaultSkill: 5 },
    { id: "1", name: "Davi", defaultPositions: { futsal: ["Fixo", "Ala Direito"], society: ["Meio-campo", "Atacante"], campo: ["Meio-campo", "Meia-atacante"] }, defaultSkill: 5 },
    { id: "23", name: "Eduardo", defaultPositions: { futsal: ["Ala Esquerdo", "Fixo"], society: ["Lateral Esquerdo", "Zagueiro"], campo: ["Lateral Esquerdo", "Zagueiro"] }, defaultSkill: 5 },
    { id: "20", name: "Felipe Augusto", defaultPositions: { futsal: ["Fixo", "Ala Esquerdo"], society: ["Meio-campo", "Zagueiro"], campo: ["Meio-campo", "Volante"] }, defaultSkill: 5 },
    { id: "15", name: "Filipe", defaultPositions: { futsal: ["Fixo", "Goleiro"], society: ["Zagueiro", "Goleiro"], campo: ["Zagueiro", "Goleiro"] }, defaultSkill: 5 },
    { id: "3", name: "Flavio", defaultPositions: { futsal: ["Ala Esquerdo", "Pivô"], society: ["Lateral Esquerdo", "Atacante"], campo: ["Lateral Esquerdo", "Ponta Esquerda"] }, defaultSkill: 5 },
    { id: "14", name: "Gustavo", defaultPositions: { futsal: ["Pivô", "Ala Direito"], society: ["Atacante", "Meio-campo"], campo: ["Centroavante", "Meia-atacante"] }, defaultSkill: 5 },
    { id: "11", name: "Igor", defaultPositions: { futsal: ["Goleiro", "Fixo"], society: ["Goleiro", "Zagueiro"], campo: ["Goleiro", "Zagueiro"] }, defaultSkill: 5 },
    { id: "13", name: "Jefferson", defaultPositions: { futsal: ["Fixo", "Ala Esquerdo"], society: ["Meio-campo", "Zagueiro"], campo: ["Meio-campo", "Volante"] }, defaultSkill: 5 },
    { id: "7", name: "Kell", defaultPositions: { futsal: ["Fixo", "Ala Esquerdo"], society: ["Meio-campo", "Atacante"], campo: ["Meio-campo", "Meia-atacante"] }, defaultSkill: 5 },
    { id: "21", name: "Leopoldo", defaultPositions: { futsal: ["Pivô", "Ala Direito"], society: ["Atacante", "Meio-campo"], campo: ["Centroavante", "Meia-atacante"] }, defaultSkill: 5 },
    { id: "9", name: "Léo", defaultPositions: { futsal: ["Fixo", "Goleiro"], society: ["Zagueiro", "Goleiro"], campo: ["Zagueiro", "Goleiro"] }, defaultSkill: 5 },
    { id: "19", name: "Lopes", defaultPositions: { futsal: ["Ala Direito", "Pivô"], society: ["Lateral Direito", "Atacante"], campo: ["Lateral Direito", "Ponta Direita"] }, defaultSkill: 5 },
    { id: "2", name: "Marcio", defaultPositions: { futsal: ["Goleiro", "Fixo"], society: ["Goleiro", "Zagueiro"], campo: ["Goleiro", "Zagueiro"] }, defaultSkill: 5 },
    { id: "17", name: "Martins", defaultPositions: { futsal: ["Fixo", "Ala Direito"], society: ["Meio-campo", "Atacante"], campo: ["Meio-campo", "Meia-atacante"] }, defaultSkill: 5 },
    { id: "6", name: "Paulo", defaultPositions: { futsal: ["Ala Direito", "Pivô"], society: ["Lateral Direito", "Atacante"], campo: ["Lateral Direito", "Ponta Direita"] }, defaultSkill: 5 },
    { id: "8", name: "Pedro", defaultPositions: { futsal: ["Pivô", "Ala Direito"], society: ["Atacante", "Meio-campo"], campo: ["Centroavante", "Meia-atacante"] }, defaultSkill: 5 },
    { id: "10", name: "Tião", defaultPositions: { futsal: ["Ala Esquerdo", "Fixo"], society: ["Lateral Esquerdo", "Zagueiro"], campo: ["Lateral Esquerdo", "Zagueiro"] }, defaultSkill: 5 },
    { id: "5", name: "Vitor", defaultPositions: { futsal: ["Goleiro", "Fixo"], society: ["Goleiro", "Zagueiro"], campo: ["Goleiro", "Zagueiro"] }, defaultSkill: 5 },
    { id: "16", name: "Wellington", defaultPositions: { futsal: ["Ala Esquerdo", "Fixo"], society: ["Lateral Esquerdo", "Zagueiro"], campo: ["Lateral Esquerdo", "Zagueiro"] }, defaultSkill: 5 },
  ]

export default function FootballTeams() {
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [gameType, setGameType] = useState<keyof typeof gameTypes | "">("")
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    position: "",
    skill: 5,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPredefinedPlayers, setSelectedPredefinedPlayers] = useState<string[]>([])
  const [editingPlayer, setEditingPlayer] = useState<{id: string, field: 'name' | 'skill'} | null>(null)
  const [editedPlayers, setEditedPlayers] = useState<{[key: string]: {name: string, skill: number}}>({})
  const isMobile = useIsMobile()

  const addPlayer = () => {
    if (newPlayer.name && newPlayer.position && gameType) {
      const player: Player = {
        id: Date.now().toString(),
        name: newPlayer.name,
        position: newPlayer.position,
        skill: newPlayer.skill,
      }
      setPlayers([...players, player])
      setNewPlayer({ name: "", position: "", skill: 5 })
    }
  }

  const removePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id))
  }

  const handleGameTypeChange = (value: keyof typeof gameTypes) => {
    setGameType(value)
    setPlayers([])
    setTeams([])
    setNewPlayer({ name: "", position: "", skill: 5 })
    setSelectedPredefinedPlayers([])
  }

  const addPredefinedPlayers = () => {
    if (!gameType || selectedPredefinedPlayers.length === 0) return

    const newPlayers: Player[] = selectedPredefinedPlayers.map((playerId) => {
      const predefinedPlayer = predefinedPlayers.find((p) => p.id === playerId)!
      const availablePositions = predefinedPlayer.defaultPositions[gameType]
      const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)]

      // Usar dados editados se existirem, senão usar padrão
      const editedData = editedPlayers[playerId] || {}
      const finalName = editedData.name || predefinedPlayer.name
      const finalSkill = editedData.skill || predefinedPlayer.defaultSkill

      return {
        id: `predefined_${playerId}`,
        name: finalName,
        position: randomPosition,
        skill: finalSkill,
      }
    })

    setPlayers([...players, ...newPlayers])
    setSelectedPredefinedPlayers([])
  }

  const startEditing = (playerId: string, field: 'name' | 'skill') => {
    setEditingPlayer({ id: playerId, field })
  }

  const saveEdit = (playerId: string, value: string | number) => {
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

  const getEditedValue = (playerId: string, field: 'name' | 'skill', defaultValue: string | number) => {
    const editedData = editedPlayers[playerId]
    if (editedData && editedData[field] !== undefined) {
      return editedData[field]
    }
    return defaultValue
  }

  const generateTeams = async () => {
    if (!gameType) return

    const playersPerTeam = gameTypes[gameType].playersPerTeam
    const totalPlayersNeeded = playersPerTeam * 2

    if (players.length < totalPlayersNeeded) {
      alert(`Você precisa de pelo menos ${totalPlayersNeeded} jogadores para ${gameTypes[gameType].name}`)
      return
    }

    setIsLoading(true)

    // Simula um pequeno delay para mostrar o loading
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Algoritmo simples para balancear times por habilidade
    const sortedPlayers = [...players].sort((a, b) => b.skill - a.skill)
    const team1: Player[] = []
    const team2: Player[] = []

    // Distribui jogadores alternadamente para balancear
    sortedPlayers.slice(0, totalPlayersNeeded).forEach((player, index) => {
      if (index % 2 === 0) {
        team1.push(player)
      } else {
        team2.push(player)
      }
    })

    const calculateAverage = (teamPlayers: Player[]) =>
      teamPlayers.reduce((sum, p) => sum + p.skill, 0) / teamPlayers.length

    const newTeams: Team[] = [
      {
        name: "Time A",
        players: team1,
        averageSkill: calculateAverage(team1),
      },
      {
        name: "Time B",
        players: team2,
        averageSkill: calculateAverage(team2),
      },
    ]

    setTeams(newTeams)
    setIsLoading(false)
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
            {/* Cadastro Manual de Jogador */}
            <Card className="bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md border-gray-200/30 dark:border-gray-700/30 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg sm:text-xl">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                  Cadastrar Novo Jogador - {gameTypes[gameType].name}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Adicione jogadores personalizados com suas posições específicas para {gameTypes[gameType].name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="sm:col-span-2 lg:col-span-1">
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
                  <div className="sm:col-span-2 lg:col-span-1">
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
                  <div>
                    <Label htmlFor="skill" className="text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                      Habilidade (1-10)
                    </Label>
                    <Input
                      id="skill"
                      type="number"
                      min="1"
                      max="10"
                      value={newPlayer.skill}
                      onChange={(e) => setNewPlayer({ ...newPlayer, skill: Number.parseInt(e.target.value) || 5 })}
                      className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/40 dark:border-gray-600/40"
                    />
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

            {/* Lista de Jogadores Pré-definidos */}
            <Card className="bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md border-gray-200/30 dark:border-gray-700/30 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg sm:text-xl">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  Jogadores Disponíveis
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Selecione os jogadores que vão participar. Clique no nome ou skill para editar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {predefinedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                        selectedPredefinedPlayers.includes(player.id)
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      onClick={() => {
                        if (selectedPredefinedPlayers.includes(player.id)) {
                          setSelectedPredefinedPlayers(selectedPredefinedPlayers.filter(id => id !== player.id))
                        } else {
                          setSelectedPredefinedPlayers([...selectedPredefinedPlayers, player.id])
                        }
                      }}
                    >
                      <Checkbox
                        checked={selectedPredefinedPlayers.includes(player.id)}
                        onChange={() => {}}
                        className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
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
                          <p
                            className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-0.5 rounded cursor-text"
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditing(player.id, 'name')
                            }}
                            title="Clique para editar o nome"
                          >
                            {getEditedValue(player.id, 'name', player.name)}
                          </p>
                        )}

                        {editingPlayer?.id === player.id && editingPlayer.field === 'skill' ? (
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={getEditedValue(player.id, 'skill', player.defaultSkill)}
                            onChange={(e) => setEditedPlayers(prev => ({
                              ...prev,
                              [player.id]: { ...prev[player.id], skill: Number(e.target.value) || 5 }
                            }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveEdit(player.id, Number(e.currentTarget.value) || 5)
                              } else if (e.key === 'Escape') {
                                cancelEdit()
                              }
                            }}
                            onBlur={() => saveEdit(player.id, getEditedValue(player.id, 'skill', player.defaultSkill))}
                            className="h-6 text-sm p-1 w-12"
                            autoFocus
                          />
                        ) : (
                          <p
                            className="text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-0.5 rounded cursor-text"
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditing(player.id, 'skill')
                            }}
                            title="Clique para editar a skill"
                          >
                            Skill: {getEditedValue(player.id, 'skill', player.defaultSkill)}/10
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={addPredefinedPlayers}
                    disabled={selectedPredefinedPlayers.length === 0}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg active:from-yellow-600 active:to-orange-600 transition-all duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Adicionar {selectedPredefinedPlayers.length} Jogador{selectedPredefinedPlayers.length !== 1 ? 'es' : ''}
                  </Button>

                  {selectedPredefinedPlayers.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPredefinedPlayers([])}
                      className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                    >
                      Limpar Seleção
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cadastro Manual de Jogador */}
            <Card className="bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md border-gray-200/30 dark:border-gray-700/30 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg sm:text-xl">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                  Cadastrar Novo Jogador - {gameTypes[gameType].name}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                  Adicione jogadores personalizados com suas posições específicas para {gameTypes[gameType].name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="sm:col-span-2 lg:col-span-1">
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
                  <div className="sm:col-span-2 lg:col-span-1">
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
                  <div>
                    <Label htmlFor="skill" className="text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                      Habilidade (1-10)
                    </Label>
                    <Input
                      id="skill"
                      type="number"
                      min="1"
                      max="10"
                      value={newPlayer.skill}
                      onChange={(e) => setNewPlayer({ ...newPlayer, skill: Number.parseInt(e.target.value) || 5 })}
                      className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/40 dark:border-gray-600/40"
                    />
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
          </>
        )}

        {/* Lista de Jogadores */}
        {gameType && (
          <Card className="bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md border-gray-200/30 dark:border-gray-700/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg sm:text-xl">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                Jogadores Cadastrados ({players.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {players.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm sm:text-base">Nenhum jogador cadastrado ainda</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-600/30 rounded-lg active:bg-gray-200/60 dark:active:bg-gray-700/60 transition-all duration-200"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800 dark:text-gray-100 text-sm sm:text-base truncate">{player.name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 text-xs"
                          >
                            {player.position}
                          </Badge>
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Skill: {player.skill}/10</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlayer(player.id)}
                        className="text-red-500 active:text-red-600 active:bg-red-100/50 dark:active:bg-red-900/30 transition-colors duration-200 ml-2 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Geração de Times */}
        {gameType && players.length > 0 && (
          <Card className="bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md border-gray-200/30 dark:border-gray-700/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-800 dark:text-gray-100 text-lg sm:text-xl">Formar Times</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Gere times balanceados para {gameTypes[gameType].name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Jogadores necessários: {gameTypes[gameType].playersPerTeam * 2} | Jogadores disponíveis:{" "}
                    {players.length}
                  </p>
                </div>
                <Button
                  onClick={generateTeams}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg active:from-purple-600 active:to-pink-600 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>
            </CardContent>
          </Card>
        )}

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {teams.map((team, index) => (
              <Card
                key={index}
                className={`bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md border-2 shadow-xl ${
                  index === 0
                    ? "border-emerald-300/50 dark:border-emerald-500/30"
                    : "border-blue-300/50 dark:border-blue-500/30"
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-gray-800 dark:text-gray-100 text-lg sm:text-xl">
                    <span className="truncate">{team.name}</span>
                    <Badge
                      variant="outline"
                      className={`${
                        index === 0
                          ? "bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 text-emerald-700 dark:text-emerald-300 border-emerald-300/50"
                          : "bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-700 dark:text-blue-300 border-blue-300/50"
                      } text-xs sm:text-sm`}
                    >
                      Média: {team.averageSkill.toFixed(1)}
                    </Badge>
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
                          <p className="font-medium text-gray-800 dark:text-gray-100 text-sm sm:text-base truncate">{player.name}</p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">{player.position}</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/50 dark:to-yellow-900/50 text-orange-700 dark:text-orange-300 text-xs ml-2 flex-shrink-0"
                        >
                          {player.skill}/10
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
