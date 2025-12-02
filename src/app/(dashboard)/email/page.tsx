import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

async function getEmails(userId: string) {
    const account = await prisma.account.findFirst({
        where: {
            userId: userId,
            provider: "azure-ad",
        },
    })

    if (!account || !account.access_token) {
        return null
    }

    try {
        const res = await fetch("https://graph.microsoft.com/v1.0/me/messages?$top=10&$select=sender,subject,bodyPreview,receivedDateTime", {
            headers: {
                Authorization: `Bearer ${account.access_token}`,
            },
        })

        if (!res.ok) {
            console.error("Graph API error", await res.text())
            return null
        }

        const data = await res.json()
        return data.value
    } catch (error) {
        console.error("Failed to fetch emails", error)
        return null
    }
}

export default async function EmailPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return <div>Please log in to view emails.</div>
    }

    // @ts-ignore
    const emails = await getEmails(session.user.id)

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Outlook Integration</h2>
                <Button>
                    <Mail className="mr-2 h-4 w-4" /> Compose
                </Button>
            </div>

            {!emails ? (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <p>Unable to fetch emails. Please ensure you are connected to Outlook.</p>
                        <p className="text-sm mt-2">Note: This requires a valid Azure AD login with Mail.Read permissions.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {emails.map((email: any) => (
                        <Card key={email.id}>
                            <CardHeader className="p-4">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base font-medium">{email.subject}</CardTitle>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(email.receivedDateTime).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    From: {email.sender.emailAddress.name} ({email.sender.emailAddress.address})
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-sm line-clamp-2">{email.bodyPreview}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
