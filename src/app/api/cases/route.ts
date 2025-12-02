import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

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
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // @ts-ignore
        const advisorId = session.user.id

        const newCase = await prisma.case.create({
            data: {
                title: body.title,
                status: body.status || 'LEAD',
                value: body.value,
                clientId: body.clientId,
                advisorId: advisorId,
            },
        })
        return NextResponse.json(newCase)
    } catch (error) {
        console.error("Failed to create case", error)
        return NextResponse.json({ error: 'Failed to create case' }, { status: 500 })
    }
}
