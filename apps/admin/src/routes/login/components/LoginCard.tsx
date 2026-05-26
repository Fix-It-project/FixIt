import type { ReactNode } from "react";
import { FixItLogo } from "@/components/FixItLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LoginCardProps {
	children: ReactNode;
}

export function LoginCard({ children }: LoginCardProps) {
	return (
		<Card className="w-full max-w-sm shadow-lg">
			<CardHeader className="space-y-1 pb-4">
				<div className="mb-2">
					<FixItLogo size={36} showText={true} />
				</div>
				<CardTitle className="text-xl">Admin Portal</CardTitle>
				<CardDescription>Sign in to access the operator dashboard.</CardDescription>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}
