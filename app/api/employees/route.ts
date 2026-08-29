import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employees = await prisma.employee.findMany({
      where: { userId: currentUser.id },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("GET /api/employees", error);
    return NextResponse.json({ error: "Failed to load employees" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const employee = await prisma.employee.create({
      data: {
        userId: currentUser.id,
        name: String(body.name).trim(),
        phone: body.phone ? String(body.phone).trim() : null,
        cnic: body.cnic ? String(body.cnic).trim() : null,
        designation: String(body.designation).trim(),
        salary: Number(body.salary),
        joiningDate: new Date(`${body.joiningDate}T00:00:00.000Z`),
        image: body.image || null,
      },
    });
    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("POST /api/employees", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
