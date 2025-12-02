import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const cases = await prisma.case.findMany({
            orderBy: { updatedAt: 'desc' },
            include: { client: true, advisor: true }
        })
        return NextResponse.json(cases)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const newCase = await prisma.case.create({
            data: {
                title: body.title,
                status: body.status || 'LEAD',
                value: body.value,
                clientId: body.clientId,
                advisorId: body.advisorId,
            },
        })
        return NextResponse.json(newCase)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create case' }, { status: 500 })
    }
}
