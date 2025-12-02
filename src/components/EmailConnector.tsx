"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle2, XCircle } from "lucide-react"
import { signIn, signOut } from "next-auth/react"

interface EmailConnectorProps {
    isConnected: boolean
    emailAddress?: string | null
}

export function EmailConnector({ isConnected, emailAddress }: EmailConnectorProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Email Connector</CardTitle>
                <CardDescription>
                    Connect your Outlook account to sync emails and calendar events.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${isConnected ? "bg-green-100" : "bg-gray-100"}`}>
                            <Mail className={`h-6 w-6 ${isConnected ? "text-green-600" : "text-gray-500"}`} />
                        </div>
                        <div>
                            <h4 className="font-medium">Microsoft Outlook</h4>
                            <p className="text-sm text-muted-foreground">
                                {isConnected
                                    ? `Connected as ${emailAddress}`
                                    : "Not connected"}
                            </p>
                        </div>
                    </div>
                    {isConnected ? (
                        <Button variant="outline" onClick={() => signOut()}>
                            Disconnect
                        </Button>
                    ) : (
                        <Button onClick={() => signIn("azure-ad")}>
                            Connect
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
