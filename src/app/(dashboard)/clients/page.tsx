import { prisma } from "@/lib/prisma"
import { ClientList } from "@/components/ClientList"
import { AddClientDialog } from "@/components/AddClientDialog"

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
    const clients = await prisma.client.findMany({
        orderBy: { name: 'asc' },
        include: {
            cases: {
                where: { status: { not: 'COMPLETED' } }
            }
        }
    })

    return (
        <div className="p-8 h-full">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
                <AddClientDialog />
            </div>
            <ClientList initialClients={clients} />
        </div>
    )
}
