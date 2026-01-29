// Tipos de enums
export type UserRole = 'PLAYER' | 'ADMIN' | 'SUPERADMIN'
export type KnockoutFormat = 'NONE' | 'SINGLE_KO' | 'DOUBLE_KO'
export type TournamentModality = 'STATIC' | 'MOVEMENT' | 'COMBINED'
export type TournamentStatus = 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED'
export type MatchStatus = 'PENDING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED'

// Tipos de respuesta API
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Tipos para formularios
export interface CreateUserInput {
  email: string
  password: string
  firstName: string
  lastName: string
  alias: string
  profilePhoto?: string // Base64
}

export interface UpdateUserInput {
  firstName?: string
  lastName?: string
  alias?: string
  profilePhoto?: string // Base64
}

export interface CreateTournamentInput {
  name: string
  description: string
  modality: TournamentModality
  hasGroupStage: boolean
  knockoutFormat: KnockoutFormat
  teamsPerGroup?: number
  teamsAdvancing?: number
  maxTeams?: number
  locationName?: string
  locationAddress?: string
  latitude?: number
  longitude?: number
  photo?: string // Base64
  startDate?: string
  endDate?: string
}

export interface CreateTeamInput {
  name?: string
  player1Id: string
  player2Id: string
}

export interface CreateTableInput {
  name: string
  location?: string
}

// Tipos para autenticación
export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends CreateUserInput {}

// Labels para mostrar en UI
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  PLAYER: 'Jugador',
  ADMIN: 'Administrador',
  SUPERADMIN: 'Super Administrador',
}

export const KNOCKOUT_FORMAT_LABELS: Record<KnockoutFormat, string> = {
  NONE: 'Sin eliminatoria',
  SINGLE_KO: 'KO Directo',
  DOUBLE_KO: 'Doble KO (con repesca)',
}

export const MODALITY_LABELS: Record<TournamentModality, string> = {
  STATIC: 'Parado',
  MOVEMENT: 'Movimiento',
  COMBINED: 'Combinado',
}

export const STATUS_LABELS: Record<TournamentStatus, string> = {
  DRAFT: 'Borrador',
  OPEN: 'Inscripciones Abiertas',
  IN_PROGRESS: 'En Curso',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
}

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Curso',
  FINISHED: 'Finalizado',
  CANCELLED: 'Cancelado',
}

// Función helper para describir el formato del torneo
export function getTournamentFormatDescription(hasGroupStage: boolean, knockoutFormat: KnockoutFormat): string {
  if (hasGroupStage) {
    if (knockoutFormat === 'NONE') {
      return 'Solo Fase de Grupos'
    }
    return `Fase de Grupos + ${KNOCKOUT_FORMAT_LABELS[knockoutFormat]}`
  }
  return KNOCKOUT_FORMAT_LABELS[knockoutFormat]
}
