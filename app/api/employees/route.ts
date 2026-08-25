import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("GET /api/employees", error);
    return NextResponse.json({ error: "Failed to load employees" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const employee = await prisma.employee.create({
      data: {
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
