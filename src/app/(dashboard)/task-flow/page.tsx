import { prisma } from "@/lib/prisma"
import { TaskFlowBoard } from "@/components/TaskFlowBoard"

export default async function TaskFlowPage() {
    const cases = await prisma.case.findMany({
        include: { client: true, advisor: true }
    })

    return (
        <div className="p-8 h-full">
            <h2 className="text-3xl font-bold tracking-tight mb-8">Task Flow</h2>
            <TaskFlowBoard initialCases={cases} />
        </div>
    )
}
