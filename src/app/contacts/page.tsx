import { db } from "@/db";
import { contacts } from "@/db/schema";
import { ContactsView } from "./contacts-view";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const rows = await db.query.contacts.findMany({ orderBy: (c, { asc }) => [asc(c.name)] });
  return <ContactsView initialContacts={rows} />;
}
