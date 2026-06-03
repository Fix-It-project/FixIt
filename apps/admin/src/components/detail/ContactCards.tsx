import { Mail, Phone } from "lucide-react";

interface ContactCardsProps {
	phone: string;
	email: string;
}

/** Shared phone + email contact cards for entity detail pages. */
export function ContactCards({ phone, email }: ContactCardsProps) {
	return (
		<div className="flex flex-col sm:flex-row gap-3">
			<a href={`tel:${phone}`} className="flex items-center gap-3 flex-1 rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/40 transition-colors">
				<span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Phone className="h-4 w-4" /></span>
				<div className="min-w-0">
					<p className="text-[11px] text-muted-foreground">Phone</p>
					<p className="text-sm text-foreground font-medium truncate">{phone}</p>
				</div>
			</a>
			<a href={`mailto:${email}`} className="flex items-center gap-3 flex-1 rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/40 transition-colors">
				<span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><Mail className="h-4 w-4" /></span>
				<div className="min-w-0">
					<p className="text-[11px] text-muted-foreground">Email</p>
					<p className="text-sm text-foreground font-medium truncate">{email}</p>
				</div>
			</a>
		</div>
	);
}
