import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import { meQuery } from "@/lib/auth-query";
import { type AdminUser, useAuthStore } from "@/stores/auth-store";
import { LoginCard } from "./components/LoginCard";

const loginSearchSchema = z.object({
	redirect: z.string().optional(),
});

export const Route = createFileRoute("/login/")({
	validateSearch: loginSearchSchema,
	beforeLoad: async ({ context }) => {
		// Already signed in (verified cookie) → skip the login form.
		const user = await context.queryClient.ensureQueryData(meQuery).catch(() => null);
		if (user) {
			useAuthStore.getState().setSession(user);
			throw redirect({ to: "/dashboard" });
		}
	},
	component: LoginRoute,
});

const loginSchema = z.object({
	email: z.string().email("Enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

function LoginRoute() {
	const { redirect } = Route.useSearch();
	const navigate = useNavigate();
	const { setSession } = useAuthStore();
	const [showPassword, setShowPassword] = useState(false);
	const [authError, setAuthError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: { email: "", password: "" },
		onSubmit: async ({ value }) => {
			setAuthError(null);

			const result = loginSchema.safeParse(value);
			if (!result.success) return;

			try {
				const { data } = await apiClient.post<{ user: AdminUser }>(
					"/api/admin/auth/login",
					value,
				);
				setSession(data.user);
				navigate({ to: redirect ?? "/dashboard" });
			} catch (error) {
				if (axios.isAxiosError(error) && error.response?.status === 401) {
					setAuthError("Invalid email or password.");
				} else {
					setAuthError("Something went wrong. Please try again.");
				}
			}
		},
	});

	return (
		<main className="flex min-h-screen items-center justify-center bg-background p-4">
			<LoginCard>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="flex flex-col gap-4"
				>
					<form.Field name="email">
						{(field) => (
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="admin@fixit.com"
									autoComplete="email"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									className={field.state.meta.errors.length > 0 ? "border-destructive" : ""}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-xs text-destructive">{String(field.state.meta.errors[0] ?? "")}</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="password">
						{(field) => (
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="password">Password</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="••••••••"
										autoComplete="current-password"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										className={field.state.meta.errors.length > 0 ? "border-destructive pr-10" : "pr-10"}
									/>
									<button
										type="button"
										onClick={() => setShowPassword((p) => !p)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
										aria-label={showPassword ? "Hide password" : "Show password"}
									>
										{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
								{field.state.meta.errors.length > 0 && (
									<p className="text-xs text-destructive">{String(field.state.meta.errors[0] ?? "")}</p>
								)}
							</div>
						)}
					</form.Field>

					{authError && (
						<div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
							<AlertCircle className="h-4 w-4 flex-shrink-0" />
							{authError}
						</div>
					)}

					<form.Subscribe selector={(s) => s.isSubmitting}>
						{(isSubmitting) => (
							<Button type="submit" className="w-full mt-1" disabled={isSubmitting}>
								{isSubmitting ? "Signing in…" : "Sign in"}
							</Button>
						)}
					</form.Subscribe>
				</form>
			</LoginCard>
		</main>
	);
}
