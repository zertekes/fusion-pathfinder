import { prisma } from "@/lib/prisma"
import { ClientList } from "@/components/ClientList"

export default async function ClientsPage() {
    const clients = await prisma.client.findMany({
        orderBy: { createdAt: 'desc' },
        include: { cases: true }
    })

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
            </div>
            <ClientList initialClients={clients} />
        </div>
    )
}
