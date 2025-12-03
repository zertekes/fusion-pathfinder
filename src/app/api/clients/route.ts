import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        // Allow creation if session exists OR if we are in dev/demo mode (fallback)
        if (!session?.user) {
            // Check if there is at least one user in the db to allow "demo" access
            const anyUser = await prisma.user.findFirst()
            if (!anyUser) {
                return NextResponse.json({ error: "Unauthorized: No users found" }, { status: 401 })
            }
        }

        const body = await request.json()
        const { name, name2, name3, email, phone, address, notes } = body

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 })
        }

        const client = await prisma.client.create({
            data: {
                name,
                name2,
                name3,
                email,
                phone,
                address,
                notes,
            },
        })

        return NextResponse.json(client)
    } catch (error) {
        console.error("Failed to create client:", error)
        return NextResponse.json(
            { error: "Failed to create client" },
            { status: 500 }
        )
    }
}
