import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        // const session = await getServerSession(authOptions)
        // if (!session) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        // }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error("Failed to fetch users:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
