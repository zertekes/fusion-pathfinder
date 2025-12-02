import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST() {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // @ts-ignore
    const userId = session.user.id

    const account = await prisma.account.findFirst({
        where: {
            userId: userId,
            provider: "azure-ad",
        },
    })

    if (!account || !account.access_token) {
        return NextResponse.json({ error: 'No Outlook account connected' }, { status: 400 })
    }

    try {
        const res = await fetch("https://graph.microsoft.com/v1.0/me/events?$top=50", {
            headers: {
                Authorization: `Bearer ${account.access_token}`,
            },
        })

        if (!res.ok) {
            return NextResponse.json({ error: 'Graph API error' }, { status: 500 })
        }

        const data = await res.json()
        const events = data.value

        // Sync to DB
        for (const event of events) {
            await prisma.event.upsert({
                where: { externalId: event.id },
                update: {
                    title: event.subject,
                    description: event.bodyPreview,
                    startTime: new Date(event.start.dateTime),
                    endTime: new Date(event.end.dateTime),
                },
                create: {
                    title: event.subject,
                    description: event.bodyPreview,
                    startTime: new Date(event.start.dateTime),
                    endTime: new Date(event.end.dateTime),
                    externalId: event.id,
                    provider: "OUTLOOK"
                }
            })
        }

        return NextResponse.json({ success: true, count: events.length })
    } catch (error) {
        console.error("Sync failed", error)
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
    }
}
