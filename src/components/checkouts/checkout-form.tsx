"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Contact {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
}

interface CheckoutFormProps {
  bookId:  number;
  title:   string;
  open:    boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function CheckoutForm({ bookId, title, open, onClose, onSaved }: CheckoutFormProps) {
  const [name,    setName]    = useState("");
  const [contact, setContact] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving,  setSaving]  = useState(false);

  const [contacts,     setContacts]     = useState<Contact[]>([]);
  const [suggestions,  setSuggestions]  = useState<Contact[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      fetch("/api/contacts").then(r => r.json()).then(setContacts);
    } else {
      setName(""); setContact(""); setDueDate("");
      setSuggestions([]); setShowDropdown(false);
    }
  }, [open]);

  function handleNameChange(val: string) {
    setName(val);
    if (val.trim().length > 0) {
      const matches = contacts.filter(c =>
        c.name.toLowerCase().includes(val.toLowerCase()) ||
        c.email?.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(matches);
      setShowDropdown(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }

  function pickContact(c: Contact) {
    setName(c.name);
    setContact(c.email ?? c.phone ?? "");
    setShowDropdown(false);
    setSuggestions([]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/checkouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, borrowerName: name, borrowerContact: contact || undefined, dueDate: dueDate || undefined }),
      });
      if (res.status === 409) { toast.error("Book is already checked out"); return; }
      if (!res.ok) { toast.error("Failed to create checkout"); return; }
      toast.success(`Checked out to ${name}`);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check Out Book</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">{title}</p>
        <form onSubmit={submit} className="space-y-3 py-2">
          <div className="relative" ref={dropdownRef}>
            <Input
              required
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              onFocus={() => name && suggestions.length > 0 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              placeholder="Borrower name *"
              autoComplete="off"
            />
            {showDropdown && (
              <ul className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
                {suggestions.map(c => (
                  <li
                    key={c.id}
                    onMouseDown={() => pickContact(c)}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                  >
                    <span className="font-medium">{c.name}</span>
                    {(c.email || c.phone) && (
                      <span className="text-muted-foreground ml-2">{c.email ?? c.phone}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="Contact (email/phone)" />
          <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} placeholder="Due date" />
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || !name.trim()}>Check Out</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
