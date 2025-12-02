import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { createdAt: 'desc' },
            include: { cases: true }
        })
        return NextResponse.json(clients)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const client = await prisma.client.create({
            data: {
                name: body.name,
                email: body.email,
                phone: body.phone,
                address: body.address,
                notes: body.notes,
            },
        })
        return NextResponse.json(client)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    }
}
