import { prisma } from "@/lib/prisma"
import { KanbanBoard } from "@/components/KanbanBoard"

export default async function CasesPage() {
    const cases = await prisma.case.findMany({
        include: { client: true, advisor: true }
    })

    return (
        <div className="p-8 h-full">
            <h2 className="text-3xl font-bold tracking-tight mb-8">Case Workflow</h2>
            <KanbanBoard initialCases={cases} />
        </div>
    )
}
