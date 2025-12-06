import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // const session = await getServerSession(authOptions)
        // if (!session) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        // }

        // Optional: Check if user is ADMIN
        // if (session.user.role !== "ADMIN") { ... }

        const body = await req.json()
        const { role, status } = body

        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: {
                role,
                status,
            },
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error("Failed to update user:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
