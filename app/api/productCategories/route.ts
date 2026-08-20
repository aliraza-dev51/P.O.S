import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const products = await prisma.productCategory.findMany({
        orderBy:{
            id:"asc"
        }
    });
    return NextResponse.json(products);
}