import { CheckCircle, Clock, ExternalLink, FileText } from "lucide-react";
import { useState } from "react";
import type { AdminTechnicianDocument } from "@/types";

function DocStatusIcon({
	status,
}: {
	status: AdminTechnicianDocument["status"];
}) {
	if (status === "uploaded")
		return <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />;
	return <Clock className="h-4 w-4 flex-shrink-0 text-amber-500" />;
}

function DocRow({ doc }: { doc: AdminTechnicianDocument }) {
	const [imgFailed, setImgFailed] = useState(false);
	const hasFile = doc.status === "uploaded" && !!doc.url;

	return (
		<div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
			<div className="flex items-center gap-2.5">
				<DocStatusIcon status={doc.status} />
				<p className="min-w-0 flex-1 font-medium text-foreground text-sm">
					{doc.kind}
				</p>
				{hasFile ? (
					<a
						href={doc.url ?? undefined}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1 font-medium text-primary text-xs hover:underline"
					>
						<ExternalLink className="h-3.5 w-3.5" /> Open
					</a>
				) : (
					<span className="font-medium text-amber-600 text-xs">
						Not uploaded
					</span>
				)}
			</div>

			{hasFile &&
				(imgFailed ? (
					<a
						href={doc.url ?? undefined}
						target="_blank"
						rel="noreferrer"
						className="mt-2 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 text-muted-foreground text-xs hover:text-foreground"
					>
						<FileText className="h-4 w-4 flex-shrink-0" />
						Preview unavailable. Open to view the file.
					</a>
				) : (
					<a
						href={doc.url ?? undefined}
						target="_blank"
						rel="noreferrer"
						className="mt-2 block"
					>
						<img
							src={doc.url ?? undefined}
							alt={doc.kind}
							onError={() => setImgFailed(true)}
							className="max-h-40 w-full rounded-md border border-border bg-background object-contain"
						/>
					</a>
				))}
		</div>
	);
}

/** Renders the technician verification documents with inline previews + open links. */
export function DocumentList({
	documents,
}: {
	documents: AdminTechnicianDocument[];
}) {
	return (
		<div className="flex flex-col gap-2">
			{documents.map((doc) => (
				<DocRow key={doc.kind} doc={doc} />
			))}
		</div>
	);
}
