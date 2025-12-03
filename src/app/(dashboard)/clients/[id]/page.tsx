import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ClientDetails } from "@/components/ClientDetails"

interface ClientPageProps {
    params: {
        id: string
    }
}

export const dynamic = 'force-dynamic'

export default async function ClientPage({ params }: ClientPageProps) {
    const client = await prisma.client.findUnique({
        where: {
            id: params.id
        },
        include: {
            cases: {
                include: {
                    advisor: true
                }
            }
        }
    })

    if (!client) {
        notFound()
    }

    return <ClientDetails client={client} />
}
