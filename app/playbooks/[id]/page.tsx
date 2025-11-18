import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { parseJsonField } from '@/lib/json-utils'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PlaybookDetailPage({ params }: Props) {
  const { id } = await params

  const playbook = await prisma.playbook.findUnique({
    where: { id },
    include: {
      phases: {
        orderBy: {
          orderIndex: 'asc',
        },
        include: {
          steps: {
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
      },
    },
  })

  if (!playbook) {
    notFound()
  }

  const intendedGroupSizeRange = parseJsonField<{ min: number; max: number }>(
    playbook.intendedGroupSizeRangeJson
  )
  const tags = parseJsonField<string[]>(playbook.tagsJson)

  const totalDuration = playbook.phases.reduce(
    (sum, phase) => sum + (phase.durationMinutes || 0),
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/playbooks"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Playbooks
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {playbook.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            {intendedGroupSizeRange && (
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {intendedGroupSizeRange.min}-{intendedGroupSizeRange.max} people
              </div>
            )}
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {totalDuration} minutes total
            </div>
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {playbook.phases.length} phases
            </div>
          </div>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {playbook.descriptionMarkdown && (
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {playbook.descriptionMarkdown}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Link
              href={`/api/playbooks/key/${playbook.key}`}
              target="_blank"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View JSON Export
            </Link>
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Edit Playbook
            </button>
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {playbook.phases.map((phase, phaseIndex) => (
            <div key={phase.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold">
                      {phaseIndex + 1}
                    </span>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {phase.name}
                    </h2>
                  </div>
                  {phase.goalMarkdown && (
                    <p className="text-gray-600 ml-11 italic">
                      Goal: {phase.goalMarkdown}
                    </p>
                  )}
                </div>
                {phase.durationMinutes && (
                  <div className="text-sm text-gray-500 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {phase.durationMinutes} min
                  </div>
                )}
              </div>

              {/* Steps */}
              <div className="space-y-4 ml-11">
                {phase.steps.map((step, stepIndex) => (
                  <div
                    key={step.id}
                    className="border-l-4 border-gray-200 pl-4 py-2"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {stepIndex + 1}.{' '}
                        {step.instructionMarkdown || 'Untitled step'}
                      </h3>
                      {step.durationMinutes && (
                        <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                          {step.durationMinutes} min
                        </span>
                      )}
                    </div>

                    {step.promptQuestionsMarkdown && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-md">
                        <p className="text-xs font-semibold text-blue-900 mb-1">
                          PROMPT QUESTIONS
                        </p>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {step.promptQuestionsMarkdown}
                        </div>
                      </div>
                    )}

                    {step.facilitatorNotesMarkdown && (
                      <div className="mt-2 p-3 bg-yellow-50 rounded-md">
                        <p className="text-xs font-semibold text-yellow-900 mb-1">
                          FACILITATOR NOTES
                        </p>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {step.facilitatorNotesMarkdown}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
