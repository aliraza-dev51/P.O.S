import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

import { paymentOperations } from "@/lib/payment"

export async function POST(request: Request) {
    const body = await request.json()

    if (body.queryType === paymentOperations.getPaymentSumByDateRange) {
        const response = await prisma.payment.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                date: {
                    gte: body.from,
                    lte: body.to,
                },
            },
        })

        return NextResponse.json(response._sum.amount)
    }
    if (body.queryType === paymentOperations.getPaymentSummaryByDateRange) {
        const response = await prisma.payment.findMany({
            select: {
                date: true,
                amount: true,
            },
            where: {
                date: {
                    gte: body.from,
                    lte: body.to,
                }
            },
            orderBy: {
                date: "asc",
            },
        })

        return NextResponse.json(response)
    }
}