import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const caseItem = await prisma.case.findUnique({
            where: { id: params.id },
            include: {
                client: true,
                advisor: true,
                activities: {
                    include: { user: true },
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!caseItem) {
            return NextResponse.json({ error: "Case not found" }, { status: 404 })
        }

        return NextResponse.json(caseItem)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch case" }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        let userId = session?.user?.id

        // Fallback for dev
        if (!userId) {
            const firstUser = await prisma.user.findFirst()
            if (firstUser) userId = firstUser.id
        }

        const body = await request.json()
        const { title, status, value, brokerName, taskOwnerName, deadline } = body

        // Fetch current case to compare for system logs
        const currentCase = await prisma.case.findUnique({
            where: { id: params.id }
        })

        const updatedCase = await prisma.case.update({
            where: { id: params.id },
            data: {
                title,
                status,
                value,
                brokerName,
                taskOwnerName,
                deadline: deadline ? new Date(deadline) : null
            },
        })

        // Log System Activities
        if (currentCase) {
            if (status && status !== currentCase.status) {
                await prisma.caseActivity.create({
                    data: {
                        caseId: params.id,
                        userId: userId,
                        type: "SYSTEM",
                        content: `Status changed from ${currentCase.status} to ${status}`
                    }
                })
            }
            if (brokerName && brokerName !== currentCase.brokerName) {
                await prisma.caseActivity.create({
                    data: {
                        caseId: params.id,
                        userId: userId,
                        type: "SYSTEM",
                        content: `Broker updated to ${brokerName}`
                    }
                })
            }
            if (taskOwnerName && taskOwnerName !== currentCase.taskOwnerName) {
                await prisma.caseActivity.create({
                    data: {
                        caseId: params.id,
                        userId: userId,
                        type: "SYSTEM",
                        content: `Task Owner updated to ${taskOwnerName}`
                    }
                })
            }
        }

        return NextResponse.json(updatedCase)
    } catch (error) {
        console.error("Error updating case:", error)
        return NextResponse.json(
            { error: "Failed to update case" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        // Add auth check here if needed

        const deletedCase = await prisma.case.delete({
            where: { id: params.id },
        })

        return NextResponse.json(deletedCase)
    } catch (error) {
        console.error("Failed to delete case:", error)
        return NextResponse.json(
            { error: "Failed to delete case" },
            { status: 500 }
        )
    }
}
