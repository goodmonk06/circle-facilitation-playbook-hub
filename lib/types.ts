// Domain Types for Playbook System

export interface GroupSizeRange {
  min: number
  max: number
}

export interface PlaybookExport {
  id: string
  communityId?: string | null
  key: string
  title: string
  description?: string | null
  intendedGroupSize?: GroupSizeRange | null
  tags?: string[] | null
  phases: PhaseExport[]
  createdAt: string
  updatedAt: string
}

export interface PhaseExport {
  id: string
  orderIndex: number
  name: string
  goal?: string | null
  durationMinutes?: number | null
  steps: StepExport[]
}

export interface StepExport {
  id: string
  orderIndex: number
  instruction?: string | null
  promptQuestions?: string | null
  facilitatorNotes?: string | null
  durationMinutes?: number | null
  meta?: Record<string, unknown> | null
}

// Form types for mutations
export interface CreatePlaybookInput {
  communityId?: string
  key: string
  title: string
  descriptionMarkdown?: string
  intendedGroupSizeRange?: GroupSizeRange
  tags?: string[]
}

export interface UpdatePlaybookInput {
  key?: string
  title?: string
  descriptionMarkdown?: string
  intendedGroupSizeRange?: GroupSizeRange
  tags?: string[]
}

export interface CreatePhaseInput {
  playbookId: string
  orderIndex: number
  name: string
  goalMarkdown?: string
  durationMinutes?: number
}

export interface UpdatePhaseInput {
  orderIndex?: number
  name?: string
  goalMarkdown?: string
  durationMinutes?: number
}

export interface CreateStepInput {
  phaseId: string
  orderIndex: number
  instructionMarkdown?: string
  promptQuestionsMarkdown?: string
  facilitatorNotesMarkdown?: string
  durationMinutes?: number
  meta?: Record<string, unknown>
}

export interface UpdateStepInput {
  orderIndex?: number
  instructionMarkdown?: string
  promptQuestionsMarkdown?: string
  facilitatorNotesMarkdown?: string
  durationMinutes?: number
  meta?: Record<string, unknown>
}
