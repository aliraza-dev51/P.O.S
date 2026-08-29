import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const toDbStatus = (status: string) => {
  const map: Record<string, string> = {
    Present: "PRESENT",
    Absent: "ABSENT",
    Off: "OFF",
    "Half Day": "HALF_DAY",
    Late: "LATE",
  };
  return map[status] || status;
};

const toClientStatus = (status: string) => {
  const map: Record<string, string> = {
    PRESENT: "Present",
    ABSENT: "Absent",
    OFF: "Off",
    HALF_DAY: "Half Day",
    LATE: "Late",
  };
  return map[status] || status;
};

const serialize = (record: any) => ({
  ...record,
  date: new Date(record.date).toISOString().split("T")[0],
  status: toClientStatus(record.status),
});

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await prisma.attendance.findMany({
      where: { userId: currentUser.id },
      orderBy: [{ date: "desc" }, { id: "desc" }],
    });
    return NextResponse.json(records.map(serialize));
  } catch (error) {
    console.error("GET /api/attendance", error);
    return NextResponse.json({ error: "Failed to load attendance" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const employeeId = Number(body.employeeId);
    const date = new Date(`${body.date}T00:00:00.000Z`);

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, userId: currentUser.id },
      select: { id: true },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const record = await prisma.attendance.upsert({
      where: { userId_employeeId_date: { userId: currentUser.id, employeeId, date } },
      create: {
        userId: currentUser.id,
        employeeId,
        date,
        inTime: body.inTime || null,
        outTime: body.outTime || null,
        status: toDbStatus(body.status) as any,
      },
      update: {
        inTime: body.inTime || null,
        outTime: body.outTime || null,
        status: toDbStatus(body.status) as any,
      },
    });
    return NextResponse.json(serialize(record), { status: 201 });
  } catch (error) {
    console.error("POST /api/attendance", error);
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
