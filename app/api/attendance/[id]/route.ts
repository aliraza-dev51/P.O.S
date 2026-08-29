import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const toDbStatus = (status: string) => ({
  Present: "PRESENT",
  Absent: "ABSENT",
  Off: "OFF",
  "Half Day": "HALF_DAY",
  Late: "LATE",
}[status] || status);

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = Number(params.id);
    const existing = await prisma.attendance.findFirst({ where: { id, userId: currentUser.id } });
    if (!existing) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 });
    }

    const body = await request.json();
    const record = await prisma.attendance.update({
      where: { id },
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
