import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const toDbStatus = (status: string) => ({
  Present: "PRESENT",
  Absent: "ABSENT",
  Off: "OFF",
  "Half Day": "HALF_DAY",
  Late: "LATE",
}[status] || status);

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const record = await prisma.attendance.update({
      where: { id: Number(params.id) },
      data: {
        inTime: body.inTime ?? null,
        outTime: body.outTime ?? null,
        status: toDbStatus(body.status) as any,
      },
    });
    return NextResponse.json({
      ...record,
      date: new Date(record.date).toISOString().split("T")[0],
      status: ({ PRESENT: "Present", ABSENT: "Absent", OFF: "Off", HALF_DAY: "Half Day", LATE: "Late" } as any)[record.status],
    });
  } catch (error) {
    console.error("PUT /api/attendance/[id]", error);
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
  }
}
