interface PlaceholderPageProps {
	title: string;
	description?: string;
}

export function PlaceholderPage({ title, description = "This section is coming soon." }: PlaceholderPageProps) {
	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 p-8 text-center">
			<h1 className="text-2xl font-bold text-foreground">{title}</h1>
			<p className="text-muted-foreground text-sm max-w-sm">{description}</p>
		</div>
	);
}
