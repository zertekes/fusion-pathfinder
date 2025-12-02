import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react"
import { SyncCalendarButton } from "@/components/SyncCalendarButton"

async function getEvents(userId: string) {
    // Fetch from local DB
    return await prisma.event.findMany({
        orderBy: { startTime: 'asc' },
        where: {
            startTime: {
                gte: new Date()
            }
        }
    })
}

export default async function CalendarPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return <div>Please log in to view calendar.</div>
    }

    // @ts-ignore
    const events = await getEvents(session.user.id)

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
                <div className="flex gap-2">
                    <SyncCalendarButton />
                    <Button>
                        <CalendarIcon className="mr-2 h-4 w-4" /> New Event
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No upcoming events found. Try syncing with Outlook.
                    </div>
                ) : (
                    events.map((event) => (
                        <Card key={event.id}>
                            <CardHeader className="p-4">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base font-medium">{event.title}</CardTitle>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleTimeString()}
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-sm line-clamp-2">{event.description}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
