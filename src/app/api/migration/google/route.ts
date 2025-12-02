import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ical from 'node-ical'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const text = await file.text()
        const events = ical.sync.parseICS(text)

        let count = 0

        for (const event of Object.values(events)) {
            if (event.type === 'VEVENT') {
                // Create Client from event summary (assuming summary is client name)
                const clientName = event.summary
                if (clientName) {
                    await prisma.client.create({
                        data: {
                            name: clientName,
                            notes: `Imported from Google Calendar. Date: ${event.start}`,
                        }
                    })
                    count++
                }
            }
        }

        return NextResponse.json({ success: true, count })
    } catch (error) {
        console.error("Migration failed", error)
        return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
    }
}
