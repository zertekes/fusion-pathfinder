import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        let userId = session?.user?.id

        // Fallback for dev/testing if no session
        if (!userId) {
            const firstUser = await prisma.user.findFirst()
            if (firstUser) userId = firstUser.id
        }

        const body = await request.json()
        const { content } = body

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 })
        }

        const activity = await prisma.caseActivity.create({
            data: {
                caseId: params.id,
                userId: userId,
                type: "COMMENT",
                content: content,
            },
            include: {
                user: true
            }
        })

        return NextResponse.json(activity)
    } catch (error) {
        console.error("Failed to create comment:", error)
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
    }
}
