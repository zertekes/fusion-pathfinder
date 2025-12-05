"use client"

import { useState } from "react"
import { Client, Case, User } from "@prisma/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Phone, MapPin, Pencil } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ClientEditDialog } from "@/components/ClientEditDialog"
import { CaseDetailsSheet } from "@/components/CaseDetailsSheet"

type ClientWithCases = Client & {
    cases: (Case & {
        advisor: User
    })[]
}

interface ClientDetailsProps {
    client: ClientWithCases
}

export function ClientDetails({ client }: ClientDetailsProps) {
    const router = useRouter()
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedCase, setSelectedCase] = useState<any>(null)
    const [isCaseSheetOpen, setIsCaseSheetOpen] = useState(false)

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/clients">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
                        {client.name2 && <h3 className="text-xl text-muted-foreground">{client.name2}</h3>}
                        {client.name3 && <h3 className="text-xl text-muted-foreground">{client.name3}</h3>}
                    </div>
                </div>
                <Button onClick={() => setIsEditDialogOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit Client
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{client.email || "No email"}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{client.phone || "No phone"}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Address</Label>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{client.address || "No address"}</span>
                            </div>
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
                            <div key={c.id} onClick={() => {
                                setSelectedCase({ ...c, client })
                                setIsCaseSheetOpen(true)
                            }}>
                                <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                                    <CardHeader className="p-4">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-base font-medium">
                                                {c.caseNumber ? <span className="text-purple-600 mr-2">{c.caseNumber}</span> : null}
                                                {c.title}
                                            </CardTitle>
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
                                            <p>Broker: {c.brokerName || "N/A"}</p>
                                            <p>Task Owner: {c.taskOwnerName || "N/A"}</p>
                                            <p>Updated: {format(new Date(c.updatedAt), "dd/MM/yyyy")}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ClientEditDialog
                client={client}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSave={() => router.refresh()}
            />

            <CaseDetailsSheet
                caseItem={selectedCase}
                open={isCaseSheetOpen}
                onOpenChange={setIsCaseSheetOpen}
                fullScreen={true}
            />
        </div>
    )
}
