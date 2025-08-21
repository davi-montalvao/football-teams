"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Users, Trophy, Plus, Loader2 } from "lucide-react"
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
          <Card className="bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md border-gray-200/30 dark:border-gray-700/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg sm:text-xl">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                Cadastrar Jogador - {gameTypes[gameType].name}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Adicione jogadores com suas posições específicas para {gameTypes[gameType].name}
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
