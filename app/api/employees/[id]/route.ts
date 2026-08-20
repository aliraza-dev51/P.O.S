import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const employee = await prisma.employee.update({
      where: { id },
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
    return NextResponse.json(employee);
  } catch (error) {
    console.error("PUT /api/employees/[id]", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/employees/[id]", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
