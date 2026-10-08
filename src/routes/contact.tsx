import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LegalHero, LegalSection, LegalUpdated, PublicShell } from "@/components/public-legal";
import { COMPANY_PLACEHOLDERS, LEGAL_UPDATED } from "@/lib/legal";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — PlastiFind" },
      {
        name: "description",
        content: "Contacter PlastiFind : e-mail professionnel et informations.",
      },
      { property: "og:title", content: "Contact — PlastiFind" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: Page,
});

function Page() {
  const [sent, setSent] = useState(false);
  return (
    <PublicShell>
      <LegalHero
        eyebrow="PlastiFind — Contact"
        title="Contacter PlastiFind"
        description="Écrivez à l'équipe pour toute question sur PlastiFind OS, les partenariats ou la vie privée."
      />
      <LegalSection id="coordonnees" title="Coordonnées">
        <p>
          E-mail :{" "}
          <a
            href={`mailto:${COMPANY_PLACEHOLDERS.contactEmail}`}
            className="text-primary underline"
          >
            {COMPANY_PLACEHOLDERS.contactEmail}
          </a>
        </p>
      </LegalSection>
      <LegalSection id="formulaire" title="Formulaire (sans envoi automatique)">
        {sent ? (
          <p className="text-foreground">
            Message préparé. Envoyez-le depuis votre messagerie à{" "}
            {COMPANY_PLACEHOLDERS.contactEmail}.
          </p>
        ) : (
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="c-name">Nom</Label>
              <Input id="c-name" required autoComplete="name" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-email">E-mail</Label>
              <Input id="c-email" type="email" required autoComplete="email" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-msg">Message</Label>
              <Textarea id="c-msg" rows={4} required />
            </div>
            <div>
              <Button type="submit">Préparer le message</Button>
            </div>
          </form>
        )}
      </LegalSection>
      <LegalUpdated date={LEGAL_UPDATED} />
    </PublicShell>
  );
}
