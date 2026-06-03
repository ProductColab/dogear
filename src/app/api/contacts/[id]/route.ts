import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { CreateContactSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const body = await req.json();
  const parsed = CreateContactSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { email, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (email !== undefined) updateData.email = email || null;
  const [updated] = await db.update(contacts).set(updateData).where(eq(contacts.id, id)).returning();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.delete(contacts).where(eq(contacts.id, parseInt(params.id)));
  return new NextResponse(null, { status: 204 });
}
