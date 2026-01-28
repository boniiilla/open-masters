import { z } from 'zod'

// Validación de usuario
export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  alias: z.string().min(2, 'El alias debe tener al menos 2 caracteres'),
  profilePhoto: z.string().optional(),
})

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido').optional(),
  lastName: z.string().min(1, 'El apellido es requerido').optional(),
  alias: z.string().min(2, 'El alias debe tener al menos 2 caracteres').optional(),
  profilePhoto: z.string().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'La confirmación es requerida'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

// Validación de torneo
export const createTournamentSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  modality: z.enum(['STATIC', 'MOVEMENT', 'COMBINED']),

  // Formato del torneo
  hasGroupStage: z.boolean().default(false),
  knockoutFormat: z.enum(['NONE', 'SINGLE_KO', 'DOUBLE_KO']).default('SINGLE_KO'),
  teamsPerGroup: z.number().int().min(2).optional(),
  teamsAdvancing: z.number().int().min(1).optional(),

  // Límite de equipos
  maxTeams: z.number().int().positive().optional().nullable(),

  // Ubicación
  locationName: z.string().optional(),
  locationAddress: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),

  // Foto
  photo: z.string().optional(),

  // Fechas
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
}).refine(data => {
  // Si hay fase de grupos, debe haber knockoutFormat o NONE
  if (data.hasGroupStage && data.knockoutFormat === 'NONE' && !data.teamsPerGroup) {
    return false
  }
  return true
}, {
  message: 'Si hay fase de grupos, especifica equipos por grupo',
  path: ['teamsPerGroup'],
})

export const updateTournamentSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').optional(),
  description: z.string().min(1, 'La descripción es requerida').optional(),
  modality: z.enum(['STATIC', 'MOVEMENT', 'COMBINED']).optional(),
  hasGroupStage: z.boolean().optional(),
  knockoutFormat: z.enum(['NONE', 'SINGLE_KO', 'DOUBLE_KO']).optional(),
  teamsPerGroup: z.number().int().min(2).optional().nullable(),
  teamsAdvancing: z.number().int().min(1).optional().nullable(),
  maxTeams: z.number().int().positive().optional().nullable(),
  locationName: z.string().optional().nullable(),
  locationAddress: z.string().optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  photo: z.string().optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'OPEN', 'IN_PROGRESS', 'FINISHED', 'CANCELLED']).optional(),
})

// Validación de equipo/pareja
export const createTeamSchema = z.object({
  name: z.string().optional(),
  player1Id: z.string().min(1, 'El jugador 1 es requerido'),
  player2Id: z.string().min(1, 'El jugador 2 es requerido'),
}).refine(data => data.player1Id !== data.player2Id, {
  message: 'Los dos jugadores deben ser diferentes',
  path: ['player2Id'],
})

// Validación de mesa
export const createTableSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  location: z.string().optional(),
})

export const updateTableSchema = createTableSchema.partial()

// Validación de partido
export const updateMatchSchema = z.object({
  team1Score: z.number().int().min(0).optional(),
  team2Score: z.number().int().min(0).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'FINISHED', 'CANCELLED']).optional(),
  winnerId: z.string().optional(),
  tableId: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
})
