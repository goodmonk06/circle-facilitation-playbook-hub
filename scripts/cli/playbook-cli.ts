#!/usr/bin/env tsx

/**
 * Playbook CLI
 *
 * Command-line tool for managing playbooks
 *
 * Usage:
 *   npx tsx scripts/cli/playbook-cli.ts <command> [options]
 *
 * Commands:
 *   list - List all playbooks
 *   show <key> - Show playbook details
 *   validate <key> - Validate playbook structure
 *   stats - Show repository statistics
 */

import { prisma } from '../../lib/prisma'
import { parseJsonField } from '../../lib/json-utils'

const commands = {
  async list() {
    console.log('📚 Listing all playbooks...\n')

    const playbooks = await prisma.playbook.findMany({
      include: {
        phases: true,
        _count: {
          select: {
            sessions: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (playbooks.length === 0) {
      console.log('No playbooks found. Run seed to create sample data.')
      return
    }

    for (const playbook of playbooks) {
      const tags = parseJsonField<string[]>(playbook.tagsJson) || []
      console.log(`${playbook.title} (${playbook.key})`)
      console.log(`  Status: ${playbook.status}`)
      console.log(`  Difficulty: ${playbook.difficulty || 'N/A'}`)
      console.log(`  Phases: ${playbook.phases.length}`)
      console.log(`  Sessions: ${playbook._count.sessions}`)
      console.log(`  Tags: ${tags.join(', ') || 'None'}`)
      console.log()
    }
  },

  async show(key?: string) {
    if (!key) {
      console.error('❌ Error: Please provide a playbook key')
      console.log('Usage: show <key>')
      process.exit(1)
    }

    console.log(`📖 Fetching playbook: ${key}...\n`)

    const playbook = await prisma.playbook.findUnique({
      where: { key },
      include: {
        phases: {
          orderBy: { orderIndex: 'asc' },
          include: {
            steps: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    })

    if (!playbook) {
      console.error(`❌ Playbook not found: ${key}`)
      process.exit(1)
    }

    const tags = parseJsonField<string[]>(playbook.tagsJson) || []
    const groupSize = parseJsonField<{ min: number; max: number }>(
      playbook.intendedGroupSizeRangeJson
    )

    console.log(`Title: ${playbook.title}`)
    console.log(`Key: ${playbook.key}`)
    console.log(`Status: ${playbook.status}`)
    console.log(`Difficulty: ${playbook.difficulty || 'N/A'}`)
    console.log(`Language: ${playbook.language}`)
    console.log(`Group Size: ${groupSize ? `${groupSize.min}-${groupSize.max}` : 'N/A'}`)
    console.log(`Tags: ${tags.join(', ') || 'None'}`)
    console.log(`\nDescription:`)
    console.log(playbook.descriptionMarkdown || 'No description')
    console.log(`\nPhases (${playbook.phases.length}):`)

    for (const phase of playbook.phases) {
      console.log(`\n  ${phase.orderIndex + 1}. ${phase.name}`)
      console.log(`     Duration: ${phase.durationMinutes || 'N/A'} minutes`)
      console.log(`     Goal: ${phase.goalMarkdown || 'N/A'}`)
      console.log(`     Steps: ${phase.steps.length}`)

      for (const step of phase.steps) {
        console.log(
          `       ${phase.orderIndex + 1}.${step.orderIndex + 1} ${step.instructionMarkdown || 'Untitled step'}`
        )
      }
    }

    console.log()
  },

  async validate(key?: string) {
    if (!key) {
      console.error('❌ Error: Please provide a playbook key')
      console.log('Usage: validate <key>')
      process.exit(1)
    }

    console.log(`🔍 Validating playbook: ${key}...\n`)

    const playbook = await prisma.playbook.findUnique({
      where: { key },
      include: {
        phases: {
          orderBy: { orderIndex: 'asc' },
          include: {
            steps: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    })

    if (!playbook) {
      console.error(`❌ Playbook not found: ${key}`)
      process.exit(1)
    }

    const issues: string[] = []

    // Validate phase ordering
    for (let i = 0; i < playbook.phases.length; i++) {
      if (playbook.phases[i].orderIndex !== i) {
        issues.push(`Phase ordering issue: expected index ${i}, got ${playbook.phases[i].orderIndex}`)
      }

      // Validate step ordering
      const steps = playbook.phases[i].steps
      for (let j = 0; j < steps.length; j++) {
        if (steps[j].orderIndex !== j) {
          issues.push(
            `Step ordering issue in phase ${i}: expected index ${j}, got ${steps[j].orderIndex}`
          )
        }
      }
    }

    // Validate completeness
    if (!playbook.title || playbook.title.trim() === '') {
      issues.push('Missing title')
    }

    if (playbook.phases.length === 0) {
      issues.push('No phases defined')
    }

    for (const phase of playbook.phases) {
      if (phase.steps.length === 0) {
        issues.push(`Phase "${phase.name}" has no steps`)
      }
    }

    if (issues.length === 0) {
      console.log('✅ Playbook is valid!')
    } else {
      console.log(`❌ Found ${issues.length} issue(s):\n`)
      for (const issue of issues) {
        console.log(`  - ${issue}`)
      }
      process.exit(1)
    }
  },

  async stats() {
    console.log('📊 Repository Statistics\n')

    const [
      playbookCount,
      phaseCount,
      stepCount,
      sessionCount,
      feedbackCount,
      userCount,
    ] = await Promise.all([
      prisma.playbook.count(),
      prisma.playbookPhase.count(),
      prisma.playbookStep.count(),
      prisma.playbookSession.count(),
      prisma.sessionFeedback.count(),
      prisma.user.count(),
    ])

    console.log(`Playbooks:   ${playbookCount}`)
    console.log(`Phases:      ${phaseCount}`)
    console.log(`Steps:       ${stepCount}`)
    console.log(`Sessions:    ${sessionCount}`)
    console.log(`Feedback:    ${feedbackCount}`)
    console.log(`Users:       ${userCount}`)

    if (playbookCount > 0) {
      const avgPhasesPerPlaybook = phaseCount / playbookCount
      const avgStepsPerPhase = phaseCount > 0 ? stepCount / phaseCount : 0

      console.log(`\nAverage phases per playbook: ${avgPhasesPerPlaybook.toFixed(1)}`)
      console.log(`Average steps per phase: ${avgStepsPerPhase.toFixed(1)}`)
    }

    console.log()
  },
}

async function main() {
  const [command, ...args] = process.argv.slice(2)

  if (!command || !(command in commands)) {
    console.log('Playbook CLI - Manage facilitation playbooks\n')
    console.log('Usage: npx tsx scripts/cli/playbook-cli.ts <command> [options]\n')
    console.log('Commands:')
    console.log('  list                  List all playbooks')
    console.log('  show <key>            Show playbook details')
    console.log('  validate <key>        Validate playbook structure')
    console.log('  stats                 Show repository statistics')
    console.log()
    process.exit(1)
  }

  try {
    await commands[command as keyof typeof commands](...args)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
