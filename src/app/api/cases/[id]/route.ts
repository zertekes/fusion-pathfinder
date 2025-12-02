import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const updatedCase = await prisma.case.update({
            where: { id: params.id },
            data: {
                status: body.status,
            },
        })
        return NextResponse.json(updatedCase)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update case' }, { status: 500 })
    }
}
