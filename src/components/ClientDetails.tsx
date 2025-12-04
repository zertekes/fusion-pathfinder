"use client"

import { useState } from "react"
import { Client, Case, User } from "@prisma/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Phone, MapPin, Pencil, Save, X } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

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
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: client.name || "",
        name2: client.name2 || "",
        name3: client.name3 || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        notes: client.notes || "",
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/clients/${client.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || "Failed to update client")
            }

            setIsEditing(false)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert(error instanceof Error ? error.message : "Failed to update client")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            name: client.name || "",
            name2: client.name2 || "",
            name3: client.name3 || "",
            email: client.email || "",
            phone: client.phone || "",
            address: client.address || "",
            notes: client.notes || "",
        })
        setIsEditing(false)
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/clients">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    {isEditing ? (
                        <div className="space-y-2">
                            <Input
                                name="name"
                                placeholder="Client Name 1 (Required)"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="text-3xl font-bold tracking-tight h-auto py-2 px-4 w-[400px]"
                            />
                            <Input
                                name="name2"
                                placeholder="Client Name 2 (Optional)"
                                value={formData.name2}
                                onChange={handleInputChange}
                                className="text-xl font-medium h-auto py-1 px-4 w-[400px]"
                            />
                            <Input
                                name="name3"
                                placeholder="Client Name 3 (Optional)"
                                value={formData.name3}
                                onChange={handleInputChange}
                                className="text-xl font-medium h-auto py-1 px-4 w-[400px]"
                            />
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
                            {client.name2 && <h3 className="text-xl text-muted-foreground">{client.name2}</h3>}
                            {client.name3 && <h3 className="text-xl text-muted-foreground">{client.name3}</h3>}
                        </div>
                    )}
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Client
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                            <X className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading}>
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            {isEditing ? (
                                <Input
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{client.email || "No email"}</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            {isEditing ? (
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{client.phone || "No phone"}</span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            {isEditing ? (
                                <Input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{client.address || "No address"}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isEditing ? (
                            <Textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                className="min-h-[150px]"
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {client.notes || "No notes available."}
                            </p>
                        )}
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
                                        <p>Updated: {format(new Date(c.updatedAt), "dd/MM/yyyy")}</p>
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
