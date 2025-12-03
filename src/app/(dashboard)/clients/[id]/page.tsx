import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

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

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/clients">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{client.email || "No email"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{client.phone || "No phone"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{client.address || "No address"}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {client.notes || "No notes available."}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Cases</h3>
                {client.cases.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            No cases found for this client.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {client.cases.map((c) => (
                            <Card key={c.id}>
                                <CardHeader className="p-4">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-base font-medium">{c.title}</CardTitle>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Task</span>
                                        <div className="text-sm font-semibold text-primary mt-1 px-2 py-1 bg-secondary rounded-md inline-block">
                                            {c.status}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        <p>Value: £{c.value?.toLocaleString() ?? 0}</p>
                                        <p>Advisor: {c.advisor.name}</p>
                                        <p>Updated: {new Date(c.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
