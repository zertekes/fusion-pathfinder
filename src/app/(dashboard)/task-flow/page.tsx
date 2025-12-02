import { prisma } from "@/lib/prisma"
import { TaskFlowBoard } from "@/components/TaskFlowBoard"
import { AddCaseDialog } from "@/components/AddCaseDialog"

export default async function TaskFlowPage() {
    const cases = await prisma.case.findMany({
        include: { client: true, advisor: true }
    })

    const clients = await prisma.client.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div className="p-8 h-full">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Task Flow</h2>
                <AddCaseDialog clients={clients} />
            </div>
            <TaskFlowBoard initialCases={cases} />
        </div>
    )
}
