import { prisma } from "@/lib/prisma"
import { CaseDetailsContent } from "@/components/CaseDetailsContent"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function CasePage({ params }: { params: { id: string } }) {
    const caseItem = await prisma.case.findUnique({
        where: { id: params.id },
        include: {
            client: true,
            advisor: true
        }
    })

    if (!caseItem) {
        notFound()
    }

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/clients/${caseItem.clientId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{caseItem.client.name}</h2>
                    <p className="text-muted-foreground">Case {caseItem.caseNumber}</p>
                </div>
            </div>

            <div className="flex-1 border rounded-lg p-6 bg-card">
                <CaseDetailsContent caseItem={caseItem} />
            </div>
        </div>
    )
}
