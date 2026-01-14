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
  society: ["Gol", "Zag", "Lat D", "Lat E", "Volante", "Meia", "Ata"],
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
  futsal: { name: "Futsal", playersPerTeam: 5, fixedTeams: true },
  society: { name: "Society", playersPerTeam: 8, fixedTeams: false },
  campo: { name: "Campo", playersPerTeam: 11, fixedTeams: true },
}

const getDefaultPositionForGameType = (gameType: keyof typeof gameTypes | ""): string => {
  if (gameType === "futsal") return "Ala D"
  if (gameType === "society") return "Volante"
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
const nameRoleOverrides: Record<string, 'ATA' | 'ZAG' | 'LE' | 'LD' | 'MEIO'> = {
  'Boka': 'ATA',
  'Bruno P': 'ATA',
  'Lopes': 'ZAG',
  'Guiomar': 'ZAG',
  'Jean': 'LE',
  'Davi': 'LE',
  'Denis': 'ZAG',
  'Lucas': 'ATA',
  'Lukinhas': 'ATA',
  'Wedson': 'ZAG',
  'Peter': 'ATA',
  'Jota': 'ATA',
  'Carlos': 'ZAG',
  'Eduardo': 'ATA',
  'Fabio Sanches': 'ZAG',
  'Leopoldo': 'ZAG',
  'Ley': 'ATA',
  'Marcelinho': 'ATA',
  'Alex': 'ATA',
  'Lucas Oliv': 'ATA',
  'Marcão': 'ATA',
  'Mariano': 'LD',
  'Michael': 'MEIO',
  'Pacheco': 'MEIO',
  'Anisio': 'ZAG',
  'Diógenes': 'ZAG',
  'Lucio': 'ZAG',
  'Emerson': 'ZAG',
  'Fernandinho': 'LE',
  'Tagavas': 'ATA',
  'Magalhães': 'LE',
  'Léo': 'ZAG',
  'Gaúcho': 'ATA',
  'Leandro Adão': 'ZAG',
  'Clayton': 'MEIO',
  'Zoio': 'ATA',
  'Renato R': 'MEIO',
  'Jhow': 'MEIO',
  'Feth': 'MEIO',
  'Fabio calça': 'MEIO',
}

// Converte o papel genérico para a posição por modalidade
const mapRoleToPosition = (gameType: keyof typeof gameTypes | "", role: 'ATA' | 'ZAG' | 'LE' | 'LD' | 'MEIO'): string => {
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
  if (role === 'MEIO') {
    if (gameType === 'futsal') return 'Ala D'
    if (gameType === 'society') return 'Meia'
    if (gameType === 'campo') return 'Meio'
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
    "Bruno P",
    "Boka",
    "Carlos",
    "Cassio",
    "Clayton",
    "Denis",
    "Davi",
    "Daniel",
    "Anisio",
    "André MM",
    "Diógenes",
    "Eduardo",
    "Fabio Sanches",
    "Fabio calça",
    "Felipe Augusto",
    "Feth",
    "Gaúcho",
    "Guiomar",
    "JP",
    "Jean",
    "Jhow",
    "Joaquim🧤",
    "Jota",
    "Kleber🧤",
    "Klebinho",
    "Koreia",
    "Alex",
    "Fernandinho",
    "Lucas Oliv",
    "Lucio",
    "Marcão",
    "Ket",
    "Leandro Adão",
    "Leopoldo",
    "Léo",
    "Ley",
    "Lopes",
    "Emerson",
    "Lucas",
    "Lukinhas",
    "Magalhães",
    "Marcelinho",
    "Mariano",
    "Marcio",
    "Michael",
    "Miquéias",
    "Pacheco",
    "Peter",
    "Renato📹",
    "Ronaldinho",
    "Tagavas",
    "Vinicius",
    "Wedson",
    "Zoio👀",
  ].sort((a, b) => a.localeCompare(b)).map((name, index) => ({
    id: String(index + 1),
    name,
    defaultPositions: {
      futsal: positionsByGameType.futsal,
      society: positionsByGameType.society,
      campo: positionsByGameType.campo,
    },
  }))

// Posições pré-definidas específicas (ex.: Koreia como Volante)
const initialEditedPlayers: {[key: string]: {position?: string}} = {}
const _kore = initialPredefinedPlayers.find(p => stripGloveEmoji(p.name).toLowerCase() === 'koreia')
if (_kore) initialEditedPlayers[_kore.id] = { position: 'Volante' }
const _andre = initialPredefinedPlayers.find(p => p.name.toLowerCase().includes('andré mm') || p.name.toLowerCase().includes('andre mm'))
if (_andre) initialEditedPlayers[_andre.id] = { position: 'Meia' }
const _ket = initialPredefinedPlayers.find(p => stripGloveEmoji(p.name).toLowerCase() === 'ket')
if (_ket) initialEditedPlayers[_ket.id] = { position: 'Volante' }

const _pacheco = initialPredefinedPlayers.find(p => p.name.toLowerCase().includes('pacheco'))
if (_pacheco) initialEditedPlayers[_pacheco.id] = { position: 'Volante' }

const _zoio = initialPredefinedPlayers.find(p => p.name.toLowerCase().includes('zoio'))
if (_zoio) initialEditedPlayers[_zoio.id] = { position: 'Ata' }

const _cassio = initialPredefinedPlayers.find(p => p.name.toLowerCase().includes('cassio'))
if (_cassio) initialEditedPlayers[_cassio.id] = { position: 'Meia' }

const _renato = initialPredefinedPlayers.find(p => p.name.toLowerCase().includes('renato'))
if (_renato) initialEditedPlayers[_renato.id] = { position: 'Meia' }

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
  const [editedPlayers, setEditedPlayers] = useState<{[key: string]: {name?: string, position?: string}}>(() => initialEditedPlayers)
  const [editingPredefinedPositionId, setEditingPredefinedPositionId] = useState<string | null>(null)

  // Configurações para society
  const [numberOfTeams, setNumberOfTeams] = useState<number>(2)
  const [playersPerTeam, setPlayersPerTeam] = useState<number>(8)
  const [societyConfigured, setSocietyConfigured] = useState<boolean>(false)

  const isMobile = useIsMobile()
  const { toast } = useToast()
  const teamsSectionRef = useRef<HTMLDivElement | null>(null)

  // Função helper para calcular jogadores necessários
  const getTotalPlayersNeeded = () => {
    if (!gameType) return 0
    if (gameType === 'society') {
      return numberOfTeams * playersPerTeam
    }
    return gameTypes[gameType].playersPerTeam * 2
  }

  const addPlayer = () => {
    if (newPlayer.name && newPlayer.position && gameType) {
      const nameTrimmed = newPlayer.name.trim()
      const normalized = nameTrimmed.replace('🧤', '').replace(' 🧤', '').trim().toLowerCase()

      // Verifica duplicatas na lista pré-definida e nos jogadores já adicionados
      const existsInPredefined = predefined.some(p => p.name.replace('🧤', '').replace(' 🧤', '').trim().toLowerCase() === normalized)
      const existsInPlayers = players.some(p => p.name.replace('🧤', '').replace(' 🧤', '').trim().toLowerCase() === normalized)
      if (existsInPredefined || existsInPlayers) {
        toast({
          title: "Nome já existe",
          description: `O jogador "${nameTrimmed}" já está cadastrado. Escolha outro nome.`,
          variant: "destructive",
        })
        return
      }

      const playerId = Date.now().toString()

      // Adiciona à lista de disponíveis
      setPredefined(prev => {
        // se a posição selecionada for goleiro, garantir emoji no nome
        const goalieLabel = getGoalkeeperPositionLabel(gameType)
        const finalNameWithEmoji = (newPlayer.position === goalieLabel || (newPlayer.position.toLowerCase && newPlayer.position.toLowerCase().includes('gol')))
          ? (nameTrimmed.includes('🧤') ? nameTrimmed : `${nameTrimmed} 🧤`)
          : nameTrimmed.replace(' 🧤','').replace('🧤','').trim()

        const next = [
          ...prev,
          {
            id: playerId,
            name: finalNameWithEmoji,
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

      // Se houver vagas necessárias, já seleciona o jogador recém-criado
      setSelectedPredefinedPlayers(prev => {
        try {
          const needed = getTotalPlayersNeeded()
          const missing = Math.max(0, needed - (players.length + prev.length))
          if (missing > 0) {
            return [...prev, playerId]
          }
        } catch (e) {
          // em caso de qualquer erro, não trava a UI
        }
        return prev
      })

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

    // Reset configurações do Society
    if (value !== 'society') {
      setSocietyConfigured(true)
    } else {
      setSocietyConfigured(false)
      setNumberOfTeams(2)
      setPlayersPerTeam(8)
    }
  }

  const addPredefinedPlayers = () => {
    if (!gameType || selectedPredefinedPlayers.length === 0) return

    const newPlayers: Player[] = selectedPredefinedPlayers.map((playerId) => {
      const predefinedPlayer = predefined.find((p) => p.id === playerId)!
      const editedPos = editedPlayers[playerId]?.position
      const finalName = (editedPlayers[playerId]?.name || predefinedPlayer.name)
      const isGoalkeeper = finalName.includes("🧤")
      const overrideRole = nameRoleOverrides[finalName.replace(' 🧤','')] as ('ATA'|'ZAG'|'LE'|'LD'|'MEIO') | undefined
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
      const overrideRole = nameRoleOverrides[finalName.replace(' 🧤','')] as ('ATA'|'ZAG'|'LE'|'LD'|'MEIO') | undefined
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

    const currentPlayersPerTeam = gameType === 'society' ? playersPerTeam : gameTypes[gameType].playersPerTeam
    const currentNumberOfTeams = gameType === 'society' ? numberOfTeams : 2
    const totalPlayersNeeded = currentPlayersPerTeam * currentNumberOfTeams

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

      // Validação: não permitir mais goleiros do que times (1 goleiro por time)
      const goalkeeperCount = selected.filter(p => {
        const pp = p.position.toLowerCase()
        return pp.includes('gol') || pp.includes('goleiro')
      }).length

      if (goalkeeperCount > currentNumberOfTeams) {
        toast({
          title: "Muitos goleiros selecionados",
          description: `Foram selecionados ${goalkeeperCount} goleiro${goalkeeperCount > 1 ? 's' : ''} para ${currentNumberOfTeams} time${currentNumberOfTeams > 1 ? 's' : ''}. Remova goleiros ou aumente o número de times.`,
          variant: "destructive",
        })
        return
      }

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

      // Validação de goleiros - mostra aviso se poucos goleiros
      const goalkeepersNeeded = currentNumberOfTeams
      const goalkeepersFound = groups.gol.length

      if (goalkeepersFound < goalkeepersNeeded) {
        // Usar setTimeout para garantir que o toast aparece após o toast de "Formando Times..."
        setTimeout(() => {
          toast({
            title: "⚠️ Aviso: Poucos goleiros",
            description: `Encontrados ${goalkeepersFound} goleiro${goalkeepersFound !== 1 ? 's' : ''}, mas são necessários ${goalkeepersNeeded} (1 por time). Times serão gerados mesmo assim.`,
            variant: "default",
          })
        }, 100)
      }

      Object.values(groups).forEach(arr => arr.sort(() => Math.random() - 0.5))

      // Criar arrays para todos os times
      const teams: Player[][] = Array.from({ length: currentNumberOfTeams }, () => [])

      // Distribuir um goleiro por time (se existirem goleiros)
      if (groups.gol && groups.gol.length > 0) {
        // round-robin: atribui até 1 goleiro por time
        let ti = 0
        while (groups.gol.length > 0 && ti < teams.length) {
          const gk = groups.gol.shift()!
          teams[ti].push(gk)
          ti++
        }
      }

      // separationGroups removido: agora qualquer jogador pode jogar com qualquer outro
      const separationGroups: string[][] = []
      const nameInTeam = (t: Player[], name: string) => t.some(p => stripGloveEmoji(p.name).toLowerCase() === stripGloveEmoji(name).toLowerCase())
      const violatesGroup = (t: Player[], candidateName: string) => {
        return separationGroups.some(group => group.includes(stripGloveEmoji(candidateName)) && group.some(member => nameInTeam(t, member)))
      }

      // Ordem desejada por vaga no time (will be repeated if playersPerTeam > length)
      const orderedSlotRoles: ('gol' | 'def' | 'meio' | 'ata')[] = [
        'gol', // Goleiro
        'def', // Zagueiro
        'def', // Zagueiro
        'def', // Lateral Direito
        'def', // Lateral Esquerdo
        'meio', // Volante
        'meio', // Meia
        'meio', // Meia
        'ata', // Atacante
      ]

      // Função para encontrar candidato em um grupo que não viole regras
      // Prioriza tipos conforme solicitado: ataque -> meia -> volante -> zagueiro -> laterais
      const findCandidateIndex = (group: Player[], team: Player[], roleKey: 'gol' | 'def' | 'meio' | 'ata') => {
        const candidateMatches = (p: Player, check: (p: Player) => boolean) => check(p) && !violatesGroup(team, p.name)

        // helpers to detect sub-positions from position label
        const pos = (p: Player) => p.position.toLowerCase()
        const isAttacker = (p: Player) => pos(p).includes('ata') || pos(p).includes('piv') || pos(p).includes('centroav') || pos(p).includes('ponto')
        const isMeia = (p: Player) => pos(p).includes('meia') && !pos(p).includes('meia a') || pos(p).includes('meio')
        const isVolante = (p: Player) => pos(p).includes('volante')
        const isZagueiro = (p: Player) => pos(p).includes('zag') || pos(p).includes('zagueiro') || pos(p).includes('fixo')
        const isLateral = (p: Player) => pos(p).includes('lat') || pos(p).includes('ponte')

        // preferências por roleKey (listas de checks em ordem)
        let checks: Array<(p: Player) => boolean> = []
        if (roleKey === 'ata') {
          // prefira atacantes que fazem parte do grupo de "bons" (primeiro separationGroups)
          checks = [
            (p) => isAttacker(p) && separationGroups[0]?.includes(stripGloveEmoji(p.name)),
            (p) => isAttacker(p),
            (p) => true,
          ]
        } else if (roleKey === 'meio') {
          // meia antes de volante
          checks = [
            (p) => isMeia(p),
            (p) => isVolante(p),
            (p) => roleOf(p.position) === 'meio',
            (p) => true,
          ]
        } else if (roleKey === 'def') {
          // zagueiro antes de lateral
          checks = [
            (p) => isZagueiro(p),
            (p) => isLateral(p),
            (p) => roleOf(p.position) === 'def',
            (p) => true,
          ]
        } else {
          checks = [(p) => roleOf(p.position) === 'gol', (p) => true]
        }

        for (const check of checks) {
          for (let i = 0; i < group.length; i++) {
            const candidate = group[i]
            if (candidateMatches(candidate, check)) return i
          }
        }
        return -1
      }

      const teamSlots = currentPlayersPerTeam

      // helpers para detectar sub-positions
      const posOf = (p: Player) => p.position.toLowerCase()
      const isAttacker = (p: Player) => posOf(p).includes('ata') || posOf(p).includes('piv') || posOf(p).includes('centroav') || posOf(p).includes('ponto') || posOf(p).includes('ponta')
      const isMeia = (p: Player) => posOf(p).includes('meia') && !posOf(p).includes('meia a') || posOf(p).includes('meio')
      const isVolante = (p: Player) => posOf(p).includes('volante')
      const isZagueiro = (p: Player) => posOf(p).includes('zag') || posOf(p).includes('zagueiro') || posOf(p).includes('fixo')
      const isLateral = (p: Player) => posOf(p).includes('lat') || posOf(p).includes('ponte') || posOf(p).includes('lateral')

      // pick index by ordered checks
      const pickIndexByChecks = (pool: Player[], team: Player[], checks: Array<(p: Player) => boolean>) => {
        for (const check of checks) {
          for (let i = 0; i < pool.length; i++) {
            const p = pool[i]
            if (check(p) && !violatesGroup(team, p.name)) return i
          }
        }
        return -1
      }

      // Distribuir jogadores por prioridade de posição para evitar concentração
      const distributeRole = (roleKey: string) => {
        let pool: Player[] = []
        if (roleKey === 'ata') pool = groups.ata
        else if (roleKey === 'gol') pool = groups.gol
        else if (roleKey === 'meia' || roleKey === 'volante') pool = groups.meio
        else pool = groups.def

        if (!pool || pool.length === 0) return

        let checks: Array<(p: Player) => boolean> = []
        if (roleKey === 'ata') {
          checks = [ (p) => isAttacker(p) && separationGroups[0]?.includes(stripGloveEmoji(p.name)), isAttacker, () => true ]
        } else if (roleKey === 'meia') {
          checks = [ isMeia, isVolante, (p) => roleOf(p.position) === 'meio', () => true ]
        } else if (roleKey === 'volante') {
          checks = [ isVolante, isMeia, (p) => roleOf(p.position) === 'meio', () => true ]
        } else if (roleKey === 'zagueiro') {
          checks = [ isZagueiro, isLateral, (p) => roleOf(p.position) === 'def', () => true ]
        } else if (roleKey === 'lateral') {
          checks = [ isLateral, isZagueiro, (p) => roleOf(p.position) === 'def', () => true ]
        } else if (roleKey === 'gol') {
          checks = [ (p) => roleOf(p.position) === 'gol', () => true ]
        }

        let placed = true
        while (placed) {
          placed = false
          for (let t = 0; t < teams.length; t++) {
            const team = teams[t]
            if (team.length >= teamSlots) continue
            const idx = pickIndexByChecks(pool, team, checks)
            if (idx !== -1) {
              const [player] = pool.splice(idx, 1)
              team.push(player)
              placed = true
            }
          }
        }
      }

      // Ordem de distribuição por prioridade solicitada
      const distributionOrder = ['ata', 'meia', 'volante', 'zagueiro', 'lateral', 'gol']
      for (const roleKey of distributionOrder) distributeRole(roleKey)

      // Após distribuição prioritária, preencher eventuais vagas restantes com heurística anterior
      const remainingPlayers = [...groups.gol, ...groups.def, ...groups.meio, ...groups.ata]
      groups.gol.length = 0; groups.def.length = 0; groups.meio.length = 0; groups.ata.length = 0

      // calcular distribuição desejada a partir dos orderedSlotRoles (mesmo comportamento anterior)
      const slots: ('gol'|'def'|'meio'|'ata')[] = Array.from({ length: teamSlots }, (_, i) => orderedSlotRoles[i % orderedSlotRoles.length])
      const desiredCounts: Record<'gol'|'def'|'meio'|'ata', number> = { gol: 0, def: 0, meio: 0, ata: 0 }
      for (let i = 0; i < teamSlots; i++) {
        const s = slots[i % slots.length]
        desiredCounts[s] = (desiredCounts[s] || 0) + 1
      }

      const currentCounts = (team: Player[]) => {
        const c: Record<'gol'|'def'|'meio'|'ata', number> = { gol: 0, def: 0, meio: 0, ata: 0 }
        for (const p of team) c[roleOf(p.position)] = (c[roleOf(p.position)] || 0) + 1
        return c
      }

      const pickBestRemainingIndex = (team: Player[], pool: Player[]) => {
        const teamCount = currentCounts(team)
        let bestIdx = -1
        let bestScore = -Infinity
        const roleCaps: Record<'gol'|'def'|'meio'|'ata', number> = {
          gol: Math.max(1, desiredCounts.gol || 1),
          def: (desiredCounts.def || 0) + 1,
          meio: (desiredCounts.meio || 0) + 1,
          ata: Math.max(1, Math.ceil(teamSlots / 4)),
        }

        for (let i = 0; i < pool.length; i++) {
          const p = pool[i]
          if (violatesGroup(team, p.name)) continue
          const r = roleOf(p.position)
          const need = (desiredCounts[r] || 0) - (teamCount[r] || 0)
          let score = need
          if ((teamCount[r] || 0) >= (roleCaps[r] || 0)) score -= 5
          if (r === 'ata') score -= Math.max(0, (teamCount.ata || 0) - Math.ceil(teamSlots / 4)) * 0.5
          if (r === 'ata' && separationGroups[0]?.includes(stripGloveEmoji(p.name))) score += 0.3

          if (score > bestScore) {
            bestScore = score
            bestIdx = i
          }
        }

        if (bestIdx !== -1) return bestIdx
        for (let i = 0; i < pool.length; i++) if (!violatesGroup(team, pool[i].name)) return i
        return 0
      }

      for (let t = 0; t < teams.length; t++) {
        const team = teams[t]
        while (team.length < teamSlots && remainingPlayers.length > 0) {
          const idx = pickBestRemainingIndex(team, remainingPlayers)
          const [player] = remainingPlayers.splice(idx, 1)
          team.push(player)
        }
      }

      // --- Redistribuição por posição para equilibrar números exatos por time ---
      // Funções auxiliares para sub-roles
      const getSubRole = (p: Player) => {
        const label = p.position.toLowerCase()
        if (label.includes('gol') || label.includes('goleiro')) return 'gol'
        if (label.includes('zag') || label.includes('zagueiro') || label.includes('fixo')) return 'zag'
        if (label.includes('lat') || label.includes('ponte') || label.includes('lateral')) return 'lat'
        if (label.includes('volante')) return 'vol'
        if ((label.includes('meia') && !label.includes('meia a')) || label.includes('meio')) return 'meio'
        if (label.includes('piv') || label.includes('centroav') || label.includes('ata') || label.includes('ponta') || label.includes('ponto')) return 'ata'
        return 'meio'
      }

      const collectAndRemove = (predicate: (p: Player) => boolean) => {
        const pool: Player[] = []
        for (const team of teams) {
          for (let i = team.length - 1; i >= 0; i--) {
            if (predicate(team[i])) {
              pool.push(...team.splice(i, 1))
            }
          }
        }
        return pool
      }

      const distributeEvenly = (pool: Player[], preferBy?: (team: Player[]) => number) => {
        const total = pool.length
        if (total === 0) return
        const base = Math.floor(total / teams.length)
        let remainder = total % teams.length

        // targets por time
        const targets = teams.map((_, idx) => base + (remainder > 0 ? 1 : 0))
        if (remainder > 0) remainder--

        // se preferBy fornecido, ordena equipes por preferencia para receber +1 primeiro
        const teamOrder = teams.map((team, idx) => ({ idx, score: preferBy ? preferBy(team) : 0 }))
        if (preferBy) teamOrder.sort((a, b) => b.score - a.score)

        // construir fila de alocação por índice de time
        const allocationOrder: number[] = []
        // first allocate one to each team in round-robin respecting targets
        for (const t of teamOrder) allocationOrder.push(t.idx)

        // agora atribuir players tentando respeitar separationGroups
        while (pool.length > 0) {
          // encontrar time com ainda espaço (prioriza teams with less than target)
          let chosenTeamIdx = -1
          for (let i = 0; i < teams.length; i++) {
            const ti = allocationOrder[i % allocationOrder.length]
            if (teams[ti].length < teamSlots && (teams[ti].filter(p => pool.some(x => x.id === p.id)).length < targets[ti] || teams[ti].length < targets[ti])) {
              chosenTeamIdx = ti
              break
            }
          }
          if (chosenTeamIdx === -1) {
            // fallback: achar qualquer time com espaço
            chosenTeamIdx = teams.findIndex(t => t.length < teamSlots)
            if (chosenTeamIdx === -1) chosenTeamIdx = 0
          }

          // selecionar jogador do pool que não viole separation e preferir quem for do grupo de "bons"
          let pickIdx = pool.findIndex(p => !violatesGroup(teams[chosenTeamIdx], p.name))
          if (pickIdx === -1) pickIdx = 0
          const [pl] = pool.splice(pickIdx, 1)
          teams[chosenTeamIdx].push(pl)
        }
      }

      // Redistribuir especificamente conforme solicitado:
      // Ordem desejada: 1) Atacantes, 2) Meias, 3) Volantes, 4) Zagueiros, 5) Laterais, 6) Goleiros
      // 1) Atacantes -> balancear exatamente (ex: 6 -> 3/3)
      const attackers = collectAndRemove(p => getSubRole(p) === 'ata')
      // Se existirem atacantes, distribuir de forma equilibrada entre os times
      // (objetivo: divisão o mais igual possível, ex: 8 -> 4/4; 6 -> 3/3)
      if (attackers.length > 0 && teams.length > 0) {
        const base = Math.floor(attackers.length / teams.length)
        let remainder = attackers.length % teams.length
        let ti = 0
        // distribuir em round-robin respeitando a capacidade de cada time
        for (const atk of attackers) {
          // avança até encontrar um time com espaço
          let attempts = 0
          while (attempts < teams.length) {
            const targetForTeam = base + (remainder > 0 ? 1 : 0)
            const currentAtaCount = teams[ti].filter(p => getSubRole(p) === 'ata').length
            if (currentAtaCount < targetForTeam && teams[ti].length < teamSlots) break
            ti = (ti + 1) % teams.length
            attempts++
          }
          teams[ti].push(atk)
          const assignedAta = teams[ti].filter(p => getSubRole(p) === 'ata').length
          if (assignedAta >= base + (remainder > 0 ? 1 : 0) && remainder > 0) remainder--
          ti = (ti + 1) % teams.length
        }
      } else {
        distributeEvenly(attackers)
      }

      // 2) Meias -> colocar preferencialmente no time com mais volantes
      const meias = collectAndRemove(p => getSubRole(p) === 'meio')
      distributeEvenly(meias, (team) => team.filter(x => getSubRole(x) === 'vol').length)

      // 3) Volantes -> balancear (ex: 5 -> 3/2)
      const volantes = collectAndRemove(p => getSubRole(p) === 'vol')
      // se houver volantes especiais na lista, distribui-los primeiro de forma equilibrada
      const specialVolanteNames = ['cassio', 'jp', 'felipe augusto', 'andre mm']
      const specials: Player[] = []
      const othersVols: Player[] = []
      for (const v of volantes) {
        if (specialVolanteNames.includes(stripGloveEmoji(v.name).toLowerCase())) specials.push(v)
        else othersVols.push(v)
      }

      if (specials.length > 0 && teams.length > 0) {
        // distribuir especiais em round-robin para equilibrar (ignora violatesGroup aqui)
        let ti = 0
        const maxPer = Math.ceil(specials.length / teams.length)
        const counts = Array.from({ length: teams.length }, () => 0)
        for (const sp of specials) {
          // encontrar próximo time com menos que maxPer (circular)
          let attempts = 0
          while (attempts < teams.length) {
            if (counts[ti] < maxPer && teams[ti].length < teamSlots) break
            ti = (ti + 1) % teams.length
            attempts++
          }
          teams[ti].push(sp)
          counts[ti]++
          ti = (ti + 1) % teams.length
        }
      }

      // distribuir os demais volantes normalmente
      if (othersVols.length > 0) distributeEvenly(othersVols)

      // 4) Zagueiros
      const zags = collectAndRemove(p => getSubRole(p) === 'zag')
      distributeEvenly(zags)

      // 5) Laterais
      const lats = collectAndRemove(p => getSubRole(p) === 'lat')
      distributeEvenly(lats)

      // 6) Goleiros - já distribuídos anteriormente (1 por time)

      // Reordenar jogadores dentro de cada time para visualização: gol, zag, lat, vol, meio, ata
      const orderKey = (p: Player) => {
        const sr = getSubRole(p)
        if (sr === 'gol') return 0
        if (sr === 'zag') return 1
        if (sr === 'lat') return 2
        if (sr === 'vol') return 3
        if (sr === 'meio') return 4
        return 5
      }
      for (const team of teams) {
        team.sort((a, b) => {
          const oa = orderKey(a)
          const ob = orderKey(b)
          if (oa !== ob) return oa - ob
          return a.name.localeCompare(b.name)
        })
      }

      // Nomes dos times
      const teamNames = [
        "Time Amarelo", "Time Azul", "Time Verde", "Time Vermelho",
        "Time Roxo", "Time Laranja", "Time Rosa", "Time Marrom"
      ]

      const built: Team[] = teams.map((teamPlayers, index) => ({
        name: teamNames[index] || `Time ${index + 1}`,
        players: teamPlayers
      }))
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
            {/* Configuração Society */}
            {gameType === 'society' && !societyConfigured && (
              <Card className="bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md border-gray-200/30 dark:border-gray-700/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-gray-800 dark:text-gray-100 text-lg sm:text-xl">Configurar Society</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    Configure quantos times e quantos jogadores por time você deseja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="numberOfTeams" className="text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                        Número de Times
                      </Label>
                      <Select
                        value={numberOfTeams.toString()}
                        onValueChange={(value) => setNumberOfTeams(parseInt(value))}
                      >
                        <SelectTrigger className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/40 dark:border-gray-600/40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md">
                          {[2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} times
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="playersPerTeam" className="text-gray-700 dark:text-gray-200 text-sm sm:text-base">
                        Jogadores por Time
                      </Label>
                      <Select
                        value={playersPerTeam.toString()}
                        onValueChange={(value) => setPlayersPerTeam(parseInt(value))}
                      >
                        <SelectTrigger className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/40 dark:border-gray-600/40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md">
                          {[5, 6, 7, 8, 9, 10, 11].map((num) => (
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
                        Total de jogadores necessários: {numberOfTeams * playersPerTeam}
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
            {(gameType !== 'society' || societyConfigured) && (
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
                        const needed = getTotalPlayersNeeded()
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
                                  const needed = getTotalPlayersNeeded()
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
                                  setEditedPlayers(prev => {
                                    const prevEntry = prev[player.id] || {}
                                    const currentName = prevEntry.name ?? player.name
                                    const goalieLabel = getGoalkeeperPositionLabel(gameType)
                                    let newName = currentName
                                    const hasEmoji = newName.includes('🧤')
                                    if (value === goalieLabel) {
                                      if (!hasEmoji) newName = `${newName} 🧤`
                                    } else {
                                      if (hasEmoji) newName = newName.replace(' 🧤','').replace('🧤','').trim()
                                    }
                                    return {
                                      ...prev,
                                      [player.id]: { ...prev[player.id], position: value, name: newName }
                                    }
                                  })
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
                      const needed = getTotalPlayersNeeded()
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
                      const needed = getTotalPlayersNeeded()
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
                      const needed = getTotalPlayersNeeded()
                      const missing = Math.max(0, needed - (players.length + selectedPredefinedPlayers.length))
                      if (needed > 0 && missing === 0) {
                        return (
                          <Button
                            onClick={() => {
                              const newPlayers = buildPlayersFromSelection()
                              const combined = newPlayers.length > 0 ? [...players, ...newPlayers] : players

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
                          const needed = getTotalPlayersNeeded()
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
            )}

            {/* Cadastrar Novo Jogador */}
            {(gameType !== 'society' || societyConfigured) && (
            <Card className="bg-gray-50/60 dark:bg-gray-900/60 backdrop-blur-md border-gray-200/30 dark:border-gray-700/30 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100 text-lg sm:text-xl">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                  Cadastrar Novo Jogador - {gameType === 'society' ? `Society (${numberOfTeams} times, ${playersPerTeam} jogadores cada)` : gameTypes[gameType].name}
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
          <div className="flex items-center justify-center sm:justify-end mb-2">
            <Button
              variant="outline"
              onClick={() => generateTeams(players)}
              disabled={isLoading}
              className="text-sm"
            >
              Gerar novamente
            </Button>
          </div>
        )}
        {teams.length > 0 && !isLoading && (
          <div ref={teamsSectionRef} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {teams.map((team, index) => {
              const teamColors = [
                { bg: "bg-yellow-50/70 dark:bg-yellow-900/20", border: "border-yellow-300/60 dark:border-yellow-500/40", badge: "bg-yellow-400", ring: "ring-yellow-200 dark:ring-yellow-700/50" },
                { bg: "bg-blue-50/70 dark:bg-blue-900/20", border: "border-blue-300/60 dark:border-blue-500/40", badge: "bg-blue-500", ring: "ring-blue-200 dark:ring-blue-700/50" },
                { bg: "bg-green-50/70 dark:bg-green-900/20", border: "border-green-300/60 dark:border-green-500/40", badge: "bg-green-500", ring: "ring-green-200 dark:ring-green-700/50" },
                { bg: "bg-red-50/70 dark:bg-red-900/20", border: "border-red-300/60 dark:border-red-500/40", badge: "bg-red-500", ring: "ring-red-200 dark:ring-red-700/50" },
                { bg: "bg-purple-50/70 dark:bg-purple-900/20", border: "border-purple-300/60 dark:border-purple-500/40", badge: "bg-purple-500", ring: "ring-purple-200 dark:ring-purple-700/50" },
                { bg: "bg-orange-50/70 dark:bg-orange-900/20", border: "border-orange-300/60 dark:border-orange-500/40", badge: "bg-orange-500", ring: "ring-orange-200 dark:ring-orange-700/50" }
              ]
              const colors = teamColors[index % teamColors.length]

              return (
              <Card
                key={index}
                className={`backdrop-blur-md border-2 shadow-xl ${colors.bg} ${colors.border}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-gray-800 dark:text-gray-100 text-lg sm:text-xl">
                    <span className="truncate flex items-center gap-2">
                      <span className={`${colors.badge} inline-block w-3 h-3 rounded-full ring-2 ${colors.ring}`}></span>
                      {team.name}
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{team.players.length}/{gameType === 'society' ? playersPerTeam : gameTypes[gameType].playersPerTeam}</span>
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
              )
            })}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}
