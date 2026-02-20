import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { db } from '~/server/db'

export const dynamic = 'force-dynamic'

// Simple debug page to see what's in the database for insights
export default async function DebugInsightsPage() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect('/login')
    }

    // Get all conversations with insights directly from DB
    const insights = await db.insight.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            conversation: {
                select: {
                    id: true,
                    subject: true,
                    processingStatus: true,
                }
            }
        }
    })

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Debug: Insights no Banco de Dados</h1>
            <p className="text-sm text-gray-500 mb-4">Últimos 5 insights gravados:</p>

            {insights.length === 0 && (
                <div className="text-red-600 bg-red-50 p-4 rounded">Nenhum insight encontrado no banco.</div>
            )}

            {insights.map((insight) => (
                <div key={insight.id} className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{insight.conversationId.substring(0, 8)}</span>
                        <span className="font-semibold">{insight.conversation?.subject || 'Sem assunto'}</span>
                        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">{insight.conversation?.processingStatus}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-semibold text-gray-700 mb-1">summary (type: {typeof insight.summary})</p>
                            <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-32">
                                {JSON.stringify(insight.summary, null, 2)?.substring(0, 400)}
                            </pre>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 mb-1">interests ({Array.isArray(insight.interests) ? insight.interests.length : 'NOT ARRAY'}):</p>
                            <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-32">
                                {JSON.stringify(insight.interests, null, 2)?.substring(0, 400)}
                            </pre>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 mb-1">objections ({Array.isArray(insight.objections) ? insight.objections.length : 'NOT ARRAY'}):</p>
                            <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-32">
                                {JSON.stringify(insight.objections, null, 2)?.substring(0, 400)}
                            </pre>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 mb-1">nextActions ({Array.isArray(insight.nextActions) ? insight.nextActions.length : 'NOT ARRAY'}):</p>
                            <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-32">
                                {JSON.stringify(insight.nextActions, null, 2)?.substring(0, 400)}
                            </pre>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 mb-1">riskSignals ({Array.isArray(insight.riskSignals) ? insight.riskSignals.length : 'NOT ARRAY'}):</p>
                            <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-32">
                                {JSON.stringify(insight.riskSignals, null, 2)?.substring(0, 400)}
                            </pre>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 mb-1">progressSignals ({Array.isArray(insight.progressSignals) ? insight.progressSignals.length : 'NOT ARRAY'}):</p>
                            <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-32">
                                {JSON.stringify(insight.progressSignals, null, 2)?.substring(0, 400)}
                            </pre>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
