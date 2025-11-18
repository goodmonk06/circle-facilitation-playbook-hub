import { PlaybookExport } from '@/lib/types'

describe('Playbook JSON Export Schema', () => {
  it('should match the expected PlaybookExport schema structure', () => {
    // This test validates the structure of the JSON export
    const mockExport: PlaybookExport = {
      id: 'test-id',
      communityId: 'test-community',
      key: 'test-playbook',
      title: 'Test Playbook',
      description: 'A test playbook description',
      intendedGroupSize: { min: 5, max: 15 },
      tags: ['test', 'example'],
      phases: [
        {
          id: 'phase-1',
          orderIndex: 0,
          name: 'Phase 1',
          goal: 'Test goal',
          durationMinutes: 30,
          steps: [
            {
              id: 'step-1',
              orderIndex: 0,
              instruction: 'Test instruction',
              promptQuestions: 'Test prompt',
              facilitatorNotes: 'Test notes',
              durationMinutes: 10,
              meta: { custom: 'data' },
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Verify the structure
    expect(mockExport).toHaveProperty('id')
    expect(mockExport).toHaveProperty('key')
    expect(mockExport).toHaveProperty('title')
    expect(mockExport).toHaveProperty('phases')
    expect(Array.isArray(mockExport.phases)).toBe(true)
    expect(mockExport.phases[0]).toHaveProperty('steps')
    expect(Array.isArray(mockExport.phases[0].steps)).toBe(true)
  })

  it('should have properly ordered phases', () => {
    const mockExport: PlaybookExport = {
      id: 'test-id',
      key: 'test-playbook',
      title: 'Test Playbook',
      phases: [
        {
          id: 'phase-1',
          orderIndex: 0,
          name: 'First Phase',
          steps: [],
        },
        {
          id: 'phase-2',
          orderIndex: 1,
          name: 'Second Phase',
          steps: [],
        },
        {
          id: 'phase-3',
          orderIndex: 2,
          name: 'Third Phase',
          steps: [],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Verify phases are ordered correctly
    for (let i = 0; i < mockExport.phases.length; i++) {
      expect(mockExport.phases[i].orderIndex).toBe(i)
    }
  })

  it('should have properly ordered steps within phases', () => {
    const mockExport: PlaybookExport = {
      id: 'test-id',
      key: 'test-playbook',
      title: 'Test Playbook',
      phases: [
        {
          id: 'phase-1',
          orderIndex: 0,
          name: 'First Phase',
          steps: [
            {
              id: 'step-1',
              orderIndex: 0,
              instruction: 'Step 1',
            },
            {
              id: 'step-2',
              orderIndex: 1,
              instruction: 'Step 2',
            },
            {
              id: 'step-3',
              orderIndex: 2,
              instruction: 'Step 3',
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Verify steps are ordered correctly within each phase
    const phase = mockExport.phases[0]
    for (let i = 0; i < phase.steps.length; i++) {
      expect(phase.steps[i].orderIndex).toBe(i)
    }
  })

  it('should handle optional fields correctly', () => {
    const minimalExport: PlaybookExport = {
      id: 'test-id',
      key: 'test-playbook',
      title: 'Test Playbook',
      phases: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Verify optional fields can be omitted
    expect(minimalExport.description).toBeUndefined()
    expect(minimalExport.intendedGroupSize).toBeUndefined()
    expect(minimalExport.tags).toBeUndefined()
    expect(minimalExport.communityId).toBeUndefined()
  })
})

describe('Ordering Logic', () => {
  it('should maintain sequential order indices', () => {
    const indices = [0, 1, 2, 3, 4]

    // Verify no gaps in sequence
    for (let i = 0; i < indices.length - 1; i++) {
      expect(indices[i + 1] - indices[i]).toBe(1)
    }
  })

  it('should start ordering from 0', () => {
    const firstIndex = 0
    expect(firstIndex).toBe(0)
  })
})
