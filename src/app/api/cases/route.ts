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
        let advisorId = session?.user?.id

        if (!advisorId) {
            // Fallback for dev/testing: use the first user found
            const firstUser = await prisma.user.findFirst()
            if (firstUser) {
                advisorId = firstUser.id
            } else {
                return NextResponse.json({ error: 'No advisor found' }, { status: 400 })
            }
        }

        const body = await request.json()
        console.log("Received case creation request:", body)
        console.log("Using advisorId:", advisorId)

        let clientId = body.clientId

        if (body.newClient) {
            console.log("Creating new client:", body.newClient)
            const newClient = await prisma.client.create({
                data: {
                    name: body.newClient.name,
                    name2: body.newClient.name2,
                    name3: body.newClient.name3,
                    email: body.newClient.email,
                    phone: body.newClient.phone,
                }
            })
            clientId = newClient.id
            console.log("New client created:", newClient)
        }

        if (!clientId) {
            return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
        }

        const newCase = await prisma.case.create({
            data: {
                title: body.title,
                status: body.status || 'LEAD',
                value: body.value,
                clientId: clientId,
                advisorId: advisorId,
            },
        })
        console.log("Case created successfully:", newCase)
        return NextResponse.json(newCase)
    } catch (error) {
        console.error("Failed to create case", error)
        return NextResponse.json({ error: 'Failed to create case' }, { status: 500 })
    }
}
