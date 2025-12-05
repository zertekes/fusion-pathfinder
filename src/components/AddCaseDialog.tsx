"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { Client } from "@prisma/client"
import { COLUMNS } from "@/components/TaskFlowBoard"

interface AddCaseDialogProps {
    clients: Client[]
}



export function AddCaseDialog({ clients }: AddCaseDialogProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedClientId, setSelectedClientId] = useState<string>("")
    const [selectedStatus, setSelectedStatus] = useState<string>(COLUMNS[0])
    const [activeTab, setActiveTab] = useState("existing")
    const [newClientData, setNewClientData] = useState({
        name: "",
        name2: "",
        name3: "",
        email: "",
        phone: ""
    })

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const isNewClient = activeTab === "new"
        let title = "New Case"
        let clientIdToUse = selectedClientId

        if (!isNewClient) {
            const client = clients.find(c => c.id === selectedClientId)
            title = client ? client.name : "New Case"
        } else {
            title = newClientData.name
            clientIdToUse = "" // Will be handled by API
        }

        const data = {
            title: title,
            clientId: clientIdToUse,
            status: selectedStatus,
            value: 0,
            advisorId: "user-id-placeholder",
            newClient: isNewClient ? newClientData : undefined
        }

        try {
            const res = await fetch("/api/cases", {
                method: "POST",
                body: JSON.stringify(data),
            })

            if (res.ok) {
                setOpen(false)
                router.refresh()
                // Reset form
                setSelectedClientId("")
                setSelectedStatus(COLUMNS[0])
                setActiveTab("existing")
                setNewClientData({ name: "", name2: "", name3: "", email: "", phone: "" })
                toast.success("Case created successfully!")
            } else {
                const errorData = await res.json()
                console.error("Failed to create case:", errorData)
                toast.error(`Failed to create case: ${errorData.error || "Unknown error"}`)
            }
        } catch (error) {
            console.error("Error submitting form:", error)
            toast.error("An error occurred. Check console.")
        } finally {
            setLoading(false)
        }
    }

    const isValid = (activeTab === "new" ? newClientData.name !== "" : selectedClientId !== "") && selectedStatus !== ""

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Client To Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Client Card</DialogTitle>
                        <DialogDescription>
                            Create a new card for the task flow.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full py-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="existing">Existing Client</TabsTrigger>
                            <TabsTrigger value="new">New Client</TabsTrigger>
                        </TabsList>

                        <TabsContent value="existing" className="space-y-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="clientId" className="text-right">
                                    Client
                                </Label>
                                <div className="col-span-3">
                                    <Select
                                        name="clientId"
                                        required={activeTab === "existing"}
                                        value={selectedClientId}
                                        onValueChange={setSelectedClientId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map((client) => (
                                                <SelectItem key={client.id} value={client.id}>
                                                    {client.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="new" className="space-y-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="newClientName" className="text-right">Name</Label>
                                <Input
                                    id="newClientName"
                                    value={newClientData.name}
                                    onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                                    className="col-span-3"
                                    placeholder="Client Name (Required)"
                                    required={activeTab === "new"}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="newClientName2" className="text-right">Name 2</Label>
                                <Input
                                    id="newClientName2"
                                    value={newClientData.name2}
                                    onChange={(e) => setNewClientData({ ...newClientData, name2: e.target.value })}
                                    className="col-span-3"
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="newClientName3" className="text-right">Name 3</Label>
                                <Input
                                    id="newClientName3"
                                    value={newClientData.name3}
                                    onChange={(e) => setNewClientData({ ...newClientData, name3: e.target.value })}
                                    className="col-span-3"
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="newClientEmail" className="text-right">Email</Label>
                                <Input
                                    id="newClientEmail"
                                    value={newClientData.email}
                                    onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                                    className="col-span-3"
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="newClientPhone" className="text-right">Phone</Label>
                                <Input
                                    id="newClientPhone"
                                    value={newClientData.phone}
                                    onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                                    className="col-span-3"
                                    placeholder="Optional"
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="grid grid-cols-4 items-center gap-4 mb-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                        <div className="col-span-3">
                            <Select
                                name="status"
                                required
                                value={selectedStatus}
                                onValueChange={setSelectedStatus}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {COLUMNS.map((col) => (
                                        <SelectItem key={col} value={col}>
                                            {col}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {/* Hidden input for advisorId - we'll handle this in the parent or API */}
                    <input type="hidden" name="advisorId" value="current-user-id" />

                    <DialogFooter>
                        <Button type="submit" disabled={loading || !isValid}>
                            {loading ? "Creating..." : "Create Card"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}
