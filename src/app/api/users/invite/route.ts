import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
    try {
        // const session = await getServerSession(authOptions)
        // if (!session) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        // }

        // Optional: Check if user is ADMIN
        // if (session.user.role !== "ADMIN") { ... }

        const body = await req.json()
        const { email, role } = body

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }

        // Check if invitation already exists
        const existingInvite = await prisma.invitation.findUnique({
            where: { email },
        })

        if (existingInvite) {
            // Update existing invite
            const token = randomBytes(32).toString("hex")
            const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

            const updatedInvite = await prisma.invitation.update({
                where: { email },
                data: {
                    token,
                    role: role || "ADVISOR",
                    expires,
                },
            })

            const link = `${process.env.NEXTAUTH_URL}/register?token=${token}`
            console.log(`[MOCK EMAIL] To: ${email}, Link: ${link}`)

            return NextResponse.json({ message: "Invitation resent", link })
        }

        // Create new invite
        const token = randomBytes(32).toString("hex")
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

        const invite = await prisma.invitation.create({
            data: {
                email,
                token,
                role: role || "ADVISOR",
                expires,
            },
        })

        const link = `${process.env.NEXTAUTH_URL}/register?token=${token}`
        console.log(`[MOCK EMAIL] To: ${email}, Link: ${link}`)

        return NextResponse.json({ message: "Invitation created", link })

    } catch (error) {
        console.error("Failed to create invitation:", error)
        return NextResponse.json({ error: `Internal Server Error: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 })
    }
}
