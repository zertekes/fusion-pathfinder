import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        // Add auth check here if needed

        const body = await request.json()
        const { status, title, value, brokerName, taskOwnerName } = body

        const updatedCase = await prisma.case.update({
            where: { id: params.id },
            data: {
                status,
                title,
                value,
                brokerName,
                taskOwnerName
            },
        })

        return NextResponse.json(updatedCase)
    } catch (error) {
        console.error("Failed to update case:", error)
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
