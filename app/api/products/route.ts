import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

import { productOperations } from "@/lib/product"

export async function GET(request: Request) {
    const products = await prisma.product.findMany({
        include: {
            productCategory: true
        }
    });
    return NextResponse.json(products)
}

export async function POST(request: Request) {
    const body = await request.json()

    if (body.queryType === productOperations.getProductNames) {
        const response = await prisma.product.findMany({
            select: {
                name: true,
            },
        })

        return NextResponse.json(response)
    }
}