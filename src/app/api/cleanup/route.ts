import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const cases = await prisma.case.findMany({
            where: {
                caseNumber: null,
                title: {
                    in: ["Test1", "Client1"]
                }
            }
        })

        const deleted = await prisma.case.deleteMany({
            where: {
                caseNumber: null,
                title: {
                    in: ["Test1", "Client1"]
                }
            }
        })

        return NextResponse.json({
            found: cases.length,
            deleted: deleted.count,
            details: cases
        })
    } catch (error) {
        return NextResponse.json({ error: "Failed to cleanup" }, { status: 500 })
    }
}
