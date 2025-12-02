import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { MigrationCard } from "@/components/MigrationCard"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { signIn } from "next-auth/react"
import { EmailConnector } from "@/components/EmailConnector"

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)
    let isConnected = false
    let emailAddress = null

    if (session?.user) {
        // @ts-ignore
        const account = await prisma.account.findFirst({
            where: {
                // @ts-ignore
                userId: session.user.id,
                provider: "azure-ad",
            },
        })
        if (account) {
            isConnected = true
            // In a real scenario, we might store the email in the account or user record
            // For now, we'll assume the user's email is the connected one if they logged in with it
            emailAddress = session.user.email
        }
    }

    return (
        <div className="p-8 space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

            <Tabs defaultValue="integrations" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>
                    <TabsTrigger value="data">Data Management</TabsTrigger>
                </TabsList>
                <TabsContent value="integrations" className="space-y-4">
                    <EmailConnector isConnected={isConnected} emailAddress={emailAddress} />
                </TabsContent>
                <TabsContent value="data" className="space-y-4">
                    <div className="max-w-xl">
                        <MigrationCard />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
