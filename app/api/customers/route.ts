import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const customers = await prisma.customer.findMany({
    });

    return NextResponse.json(customers);
}