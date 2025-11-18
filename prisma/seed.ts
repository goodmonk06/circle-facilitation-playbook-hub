import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data
  await prisma.playbookStep.deleteMany()
  await prisma.playbookPhase.deleteMany()
  await prisma.playbook.deleteMany()

  // Seed 1: Deep Sharing Circle
  console.log('Creating Deep Sharing Circle playbook...')
  const deepSharingCircle = await prisma.playbook.create({
    data: {
      key: 'deep-sharing-circle',
      title: 'Deep Sharing Circle',
      descriptionMarkdown: `A structured facilitation format for creating authentic connection and deep sharing within a group.

This playbook guides participants through a journey of increasingly vulnerable sharing, building trust and understanding along the way.`,
      intendedGroupSizeRangeJson: JSON.stringify({ min: 4, max: 12 }),
      tagsJson: JSON.stringify(['connection', 'sharing', 'vulnerability', 'circle']),
      phases: {
        create: [
          {
            orderIndex: 0,
            name: 'Opening & Grounding',
            goalMarkdown: 'Create a safe container and bring presence to the group',
            durationMinutes: 15,
            steps: {
              create: [
                {
                  orderIndex: 0,
                  instructionMarkdown: 'Welcome participants and explain the format',
                  promptQuestionsMarkdown: null,
                  facilitatorNotesMarkdown: 'Set a calm, welcoming tone. Speak slowly and intentionally.',
                  durationMinutes: 3,
                },
                {
                  orderIndex: 1,
                  instructionMarkdown: 'Lead a grounding meditation or breathing exercise',
                  promptQuestionsMarkdown: null,
                  facilitatorNotesMarkdown: 'Guide 2-3 minutes of silence. Ring a bell to signal transitions.',
                  durationMinutes: 5,
                },
                {
                  orderIndex: 2,
                  instructionMarkdown: 'Establish circle agreements',
                  promptQuestionsMarkdown: `- Confidentiality: What's shared here stays here
- Listen without judgment
- Speak from "I" perspective
- You can pass if you need to`,
                  facilitatorNotesMarkdown: 'Invite the group to verbally agree to these principles.',
                  durationMinutes: 7,
                },
              ],
            },
          },
          {
            orderIndex: 1,
            name: 'Warm-up Round',
            goalMarkdown: 'Ease into sharing with lighter questions to build comfort',
            durationMinutes: 20,
            steps: {
              create: [
                {
                  orderIndex: 0,
                  instructionMarkdown: 'Invite each person to share their name and a brief check-in',
                  promptQuestionsMarkdown: `"Share your name and: What brought you here today? What are you arriving with?"`,
                  facilitatorNotesMarkdown: 'Model vulnerability by sharing first. Keep your share authentic but brief (1-2 minutes).',
                  durationMinutes: 20,
                },
              ],
            },
          },
          {
            orderIndex: 2,
            name: 'Deep Sharing Round',
            goalMarkdown: 'Create space for authentic, vulnerable sharing',
            durationMinutes: 60,
            steps: {
              create: [
                {
                  orderIndex: 0,
                  instructionMarkdown: 'Introduce the deep sharing prompt',
                  promptQuestionsMarkdown: `"Think of a moment in your life when you felt truly seen and accepted for who you are. What was that like for you?"

Alternative prompts:
- "What's a story you've never told, but wish someone would ask about?"
- "What are you learning about yourself right now?"`,
                  facilitatorNotesMarkdown: 'Offer 2 minutes of silence for reflection before beginning. Remind: no cross-talk, just witnessing.',
                  durationMinutes: 5,
                },
                {
                  orderIndex: 1,
                  instructionMarkdown: 'Facilitate popcorn-style sharing',
                  promptQuestionsMarkdown: null,
                  facilitatorNotesMarkdown: 'Allow organic flow - whoever feels called speaks next. Limit to 5-7 minutes per person. Gently guide if someone goes long.',
                  durationMinutes: 55,
                },
              ],
            },
          },
          {
            orderIndex: 3,
            name: 'Integration & Closing',
            goalMarkdown: 'Honor what was shared and close the container',
            durationMinutes: 15,
            steps: {
              create: [
                {
                  orderIndex: 0,
                  instructionMarkdown: 'Invite brief reflections',
                  promptQuestionsMarkdown: `"In one word or short phrase: What are you taking with you from this circle?"`,
                  facilitatorNotesMarkdown: 'Quick popcorn round - just a few words each.',
                  durationMinutes: 7,
                },
                {
                  orderIndex: 1,
                  instructionMarkdown: 'Close with appreciation',
                  promptQuestionsMarkdown: null,
                  facilitatorNotesMarkdown: 'Thank the group. Optional: lead a closing practice like hand-to-heart or collective exhale.',
                  durationMinutes: 5,
                },
                {
                  orderIndex: 2,
                  instructionMarkdown: 'Practical closing',
                  promptQuestionsMarkdown: null,
                  facilitatorNotesMarkdown: 'Share any next steps or ways to stay connected. Remind of confidentiality.',
                  durationMinutes: 3,
                },
              ],
            },
          },
        ],
      },
    },
  })

  // Seed 2: Visioning Workshop
  console.log('Creating Visioning Workshop playbook...')
  const visioningWorkshop = await prisma.playbook.create({
    data: {
      key: 'visioning-workshop',
      title: 'Visioning Workshop',
      descriptionMarkdown: `A facilitation framework for co-creating a shared vision with a group.

This playbook uses structured imagination exercises and collaborative sense-making to help teams, communities, or organizations envision their desired future.`,
      intendedGroupSizeRangeJson: JSON.stringify({ min: 5, max: 25 }),
      tagsJson: JSON.stringify(['visioning', 'strategy', 'future', 'collaboration', 'workshop']),
      phases: {
        create: [
          {
            orderIndex: 0,
            name: 'Context Setting',
            goalMarkdown: 'Align on purpose and establish shared understanding',
            durationMinutes: 20,
            steps: {
              create: [
                {
                  orderIndex: 0,
                  instructionMarkdown: 'Frame the visioning work',
                  promptQuestionsMarkdown: `Why are we creating a vision?
What timeframe are we visioning for?
What question are we trying to answer?`,
                  facilitatorNotesMarkdown: 'Be crisp and clear. Write the core question on a visible board.',
                  durationMinutes: 10,
                },
                {
                  orderIndex: 1,
                  instructionMarkdown: 'Individual reflection on current state',
                  promptQuestionsMarkdown: `"Where are we now? What's the current reality?"`,
                  facilitatorNotesMarkdown: '5 minutes silent writing. Encourage honest assessment without judgment.',
                  durationMinutes: 10,
                },
              ],
            },
          },
          {
            orderIndex: 1,
            name: 'Individual Visioning',
            goalMarkdown: 'Generate diverse, bold visions from individuals',
            durationMinutes: 30,
            steps: {
              create: [
                {
                  orderIndex: 0,
                  instructionMarkdown: 'Guided visualization exercise',
                  promptQuestionsMarkdown: `"Close your eyes. Imagine it's [X years] in the future, and our vision has been fully realized..."

- What do you see?
- What are people saying?
- How does it feel?
- What's different from today?`,
                  facilitatorNotesMarkdown: 'Speak slowly. Leave long pauses. Create an immersive experience. Optional: use soft background music.',
                  durationMinutes: 10,
                },
                {
                  orderIndex: 1,
                  instructionMarkdown: 'Capture individual visions',
                  promptQuestionsMarkdown: `Write or draw your vision. Include:
- Key features/elements
- Emotional qualities
- Specific details that make it vivid`,
                  facilitatorNotesMarkdown: 'Provide large paper, markers, sticky notes. Encourage non-linear capture (drawings, mind maps, etc.)',
                  durationMinutes: 20,
                },
              ],
            },
          },
          {
            orderIndex: 2,
            name: 'Collective Sense-Making',
            goalMarkdown: 'Identify patterns and synthesize shared vision elements',
            durationMinutes: 45,
            steps: {
              create: [
                {
                  orderIndex: 0,
                  instructionMarkdown: 'Gallery walk',
                  promptQuestionsMarkdown: `Walk around and view everyone's visions. Notice:
- What themes emerge?
- What surprises you?
- What resonates?`,
                  facilitatorNotesMarkdown: 'Silence during the walk. Let people absorb without discussion yet.',
                  durationMinutes: 10,
                },
                {
                  orderIndex: 1,
                  instructionMarkdown: 'Harvest themes in small groups',
                  promptQuestionsMarkdown: `In groups of 4-5, discuss:
- What patterns do you notice across visions?
- What are the essential elements that appear repeatedly?
- What's the essence we're reaching for?`,
                  facilitatorNotesMarkdown: 'Assign a note-taker for each group. Give each group different colored markers.',
                  durationMinutes: 20,
                },
                {
                  orderIndex: 2,
                  instructionMarkdown: 'Share group themes with full group',
                  promptQuestionsMarkdown: null,
                  facilitatorNotesMarkdown: 'Capture all themes visibly. Look for overlaps and connections as you go.',
                  durationMinutes: 15,
                },
              ],
            },
          },
          {
            orderIndex: 3,
            name: 'Vision Synthesis',
            goalMarkdown: 'Co-create a unified vision statement or framework',
            durationMinutes: 40,
            steps: {
              create: [
                {
                  orderIndex: 0,
                  instructionMarkdown: 'Collaborative drafting',
                  promptQuestionsMarkdown: `As a group, craft a vision statement or framework that integrates the core themes.

Consider:
- Lead with aspiration
- Be specific enough to guide action
- Be broad enough to inspire
- Use vivid, evocative language`,
                  facilitatorNotesMarkdown: 'Use a shared doc or large board. Let multiple people contribute. Facilitator acts as scribe/editor.',
                  durationMinutes: 30,
                },
                {
                  orderIndex: 1,
                  instructionMarkdown: 'Test and refine',
                  promptQuestionsMarkdown: `Read it aloud. Ask:
- Does this inspire you?
- Do you see yourself in it?
- What's missing?
- What could be clearer?`,
                  facilitatorNotesMarkdown: 'Iterate quickly. Aim for good enough, not perfect. Can refine after the session.',
                  durationMinutes: 10,
                },
              ],
            },
          },
          {
            orderIndex: 4,
            name: 'Commitment & Next Steps',
            goalMarkdown: 'Ground the vision in action commitments',
            durationMinutes: 25,
            steps: {
              create: [
                {
                  orderIndex: 0,
                  instructionMarkdown: 'Identify first steps toward the vision',
                  promptQuestionsMarkdown: `"What are concrete actions we can take in the next 3 months to move toward this vision?"`,
                  facilitatorNotesMarkdown: 'Brainstorm quickly. Capture all ideas. Can prioritize later.',
                  durationMinutes: 15,
                },
                {
                  orderIndex: 1,
                  instructionMarkdown: 'Personal commitments',
                  promptQuestionsMarkdown: `"What's one thing YOU will do to bring this vision to life?"`,
                  facilitatorNotesMarkdown: 'Quick popcorn round. Encourage specific, time-bound commitments.',
                  durationMinutes: 10,
                },
              ],
            },
          },
          {
            orderIndex: 5,
            name: 'Closing',
            goalMarkdown: 'Celebrate and close the container',
            durationMinutes: 10,
            steps: {
              create: [
                {
                  orderIndex: 0,
                  instructionMarkdown: 'Appreciation circle',
                  promptQuestionsMarkdown: null,
                  facilitatorNotesMarkdown: 'Invite brief words of appreciation for the group, the process, or specific contributions.',
                  durationMinutes: 7,
                },
                {
                  orderIndex: 1,
                  instructionMarkdown: 'Logistics and follow-up',
                  promptQuestionsMarkdown: null,
                  facilitatorNotesMarkdown: 'Share how the vision document will be distributed. Clarify next meeting or check-in.',
                  durationMinutes: 3,
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log('✅ Seed completed!')
  console.log(`Created playbooks:`)
  console.log(`  - ${deepSharingCircle.title} (key: ${deepSharingCircle.key})`)
  console.log(`  - ${visioningWorkshop.title} (key: ${visioningWorkshop.key})`)
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
