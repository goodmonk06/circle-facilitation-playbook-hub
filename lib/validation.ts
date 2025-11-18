import { z } from 'zod'

// Group Size Range Schema
export const groupSizeRangeSchema = z.object({
  min: z.number().int().positive(),
  max: z.number().int().positive(),
}).refine((data) => data.max >= data.min, {
  message: 'Max group size must be greater than or equal to min',
})

// Playbook Schemas
export const createPlaybookSchema = z.object({
  communityId: z.string().optional(),
  key: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, {
    message: 'Key must contain only lowercase letters, numbers, and hyphens',
  }),
  title: z.string().min(1).max(200),
  descriptionMarkdown: z.string().optional(),
  intendedGroupSizeRange: groupSizeRangeSchema.optional(),
  tags: z.array(z.string()).optional(),
})

export const updatePlaybookSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  title: z.string().min(1).max(200).optional(),
  descriptionMarkdown: z.string().optional(),
  intendedGroupSizeRange: groupSizeRangeSchema.optional(),
  tags: z.array(z.string()).optional(),
})

// Phase Schemas
export const createPhaseSchema = z.object({
  playbookId: z.string(),
  orderIndex: z.number().int().min(0),
  name: z.string().min(1).max(200),
  goalMarkdown: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
})

export const updatePhaseSchema = z.object({
  orderIndex: z.number().int().min(0).optional(),
  name: z.string().min(1).max(200).optional(),
  goalMarkdown: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
})

// Step Schemas
export const createStepSchema = z.object({
  phaseId: z.string(),
  orderIndex: z.number().int().min(0),
  instructionMarkdown: z.string().optional(),
  promptQuestionsMarkdown: z.string().optional(),
  facilitatorNotesMarkdown: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  meta: z.record(z.unknown()).optional(),
})

export const updateStepSchema = z.object({
  orderIndex: z.number().int().min(0).optional(),
  instructionMarkdown: z.string().optional(),
  promptQuestionsMarkdown: z.string().optional(),
  facilitatorNotesMarkdown: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  meta: z.record(z.unknown()).optional(),
})

// Type exports
export type CreatePlaybookInput = z.infer<typeof createPlaybookSchema>
export type UpdatePlaybookInput = z.infer<typeof updatePlaybookSchema>
export type CreatePhaseInput = z.infer<typeof createPhaseSchema>
export type UpdatePhaseInput = z.infer<typeof updatePhaseSchema>
export type CreateStepInput = z.infer<typeof createStepSchema>
export type UpdateStepInput = z.infer<typeof updateStepSchema>
