import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { CreateContactSchema } from "@/lib/validations";
import { ilike, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  const rows = await db.query.contacts.findMany({
    where: q ? or(ilike(contacts.name, `%${q}%`), ilike(contacts.email!, `%${q}%`)) : undefined,
    orderBy: (c, { asc }) => [asc(c.name)],
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateContactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { email, ...rest } = parsed.data;
  const [contact] = await db.insert(contacts).values({ ...rest, email: email || null }).returning();
  return NextResponse.json(contact, { status: 201 });
}
