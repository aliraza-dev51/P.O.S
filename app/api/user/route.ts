import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // -------------------------------------------------
    // Current user
    // -------------------------------------------------
    //
    // Filhal hum Admin user fetch kar rahe hain.
    // Auth.js session connect hone ke baad yahan
    // session.user.id use hoga.
    //

    const user = await (prisma as typeof prisma & { user: typeof prisma extends { user: infer T } ? T : any }).user.findFirst({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("GET USER ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load user",
      },
      {
        status: 500,
      }
    );
  }
}