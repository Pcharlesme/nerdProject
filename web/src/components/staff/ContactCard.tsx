import { Mail, MapPin, Phone, User } from "lucide-react";
import { InfoField } from "@/components/ui/InfoField";
import type { ContactInfo } from "@/types";

export function ContactCard({ title, contact }: { title: string; contact: ContactInfo }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-text">{title}</h3>
      <dl className="space-y-3 text-sm">
        <InfoField icon={User} label="Name">
          {contact.name}
        </InfoField>
        {contact.email && (
          <InfoField icon={Mail} label="Email">
            {contact.email}
          </InfoField>
        )}
        {contact.phone && (
          <InfoField icon={Phone} label="Phone">
            {contact.phone}
          </InfoField>
        )}
        {contact.address && (
          <InfoField icon={MapPin} label="Address">
            {contact.address}
          </InfoField>
        )}
      </dl>
    </div>
  );
}
