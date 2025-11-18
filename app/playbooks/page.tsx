import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { parseJsonField } from '@/lib/json-utils'

export default async function PlaybooksPage() {
  const playbooks = await prisma.playbook.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      phases: {
        orderBy: {
          orderIndex: 'asc',
        },
      },
    },
  })

  const playbooksWithParsedData = playbooks.map((playbook) => ({
    ...playbook,
    intendedGroupSizeRange: parseJsonField<{ min: number; max: number }>(
      playbook.intendedGroupSizeRangeJson
    ),
    tags: parseJsonField<string[]>(playbook.tagsJson),
  }))

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Facilitation Playbooks
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Step-by-step guides for circles, workshops, and group sessions
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {playbooksWithParsedData.map((playbook) => (
            <Link
              key={playbook.id}
              href={`/playbooks/${playbook.id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {playbook.title}
                </h2>
                {playbook.descriptionMarkdown && (
                  <p className="text-gray-600 line-clamp-3">
                    {playbook.descriptionMarkdown.split('\n')[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {playbook.intendedGroupSizeRange && (
                  <div className="flex items-center text-gray-700">
                    <svg
                      className="w-5 h-5 mr-2"
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
                    <span>
                      {playbook.intendedGroupSizeRange.min}-
                      {playbook.intendedGroupSizeRange.max} people
                    </span>
                  </div>
                )}

                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 mr-2"
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
                  <span>{playbook.phases.length} phases</span>
                </div>

                {playbook.tags && playbook.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {playbook.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {playbooksWithParsedData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No playbooks found. Run the seed command to create sample data.
            </p>
            <code className="mt-4 inline-block bg-gray-100 px-4 py-2 rounded text-sm">
              npm run db:seed
            </code>
          </div>
        )}
      </div>
    </div>
  )
}
