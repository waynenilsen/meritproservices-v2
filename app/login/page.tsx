"use client";

import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useTRPC } from "@/trpc/client";

const ERROR_MESSAGES: Record<string, string> = {
	missing_token: "Invalid link. Please try again.",
	invalid_or_expired: "This link has expired. Please request a new one.",
};

export default function LoginPage() {
	return (
		<Suspense>
			<LoginForm />
		</Suspense>
	);
}

function LoginForm() {
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);
	const [error, setError] = useState("");
	const trpc = useTRPC();
	const searchParams = useSearchParams();
	const urlError = searchParams.get("error");

	const sendMagicLink = useMutation(trpc.auth.sendMagicLink.mutationOptions());

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");

		try {
			await sendMagicLink.mutateAsync({ email });
			setSent(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to send link");
		}
	}

	if (sent) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50">
				<div className="w-full max-w-sm space-y-4 p-8 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Check your email
					</h1>
					<p className="text-sm text-gray-500">
						We sent a sign-in link to <strong>{email}</strong>
					</p>
					<button
						type="button"
						onClick={() => setSent(false)}
						className="text-sm font-medium text-black hover:underline"
					>
						Use a different email
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50">
			<div className="w-full max-w-sm space-y-6 p-8">
				<div className="text-center">
					<h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
					<p className="mt-2 text-sm text-gray-500">
						Enter your email to receive a sign-in link
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700"
						>
							Email
						</label>
						<input
							id="email"
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
						/>
					</div>

					{(error || urlError) && (
						<p className="text-sm text-red-600">
							{error ||
								ERROR_MESSAGES[urlError ?? ""] ||
								"Something went wrong"}
						</p>
					)}

					<button
						type="submit"
						disabled={sendMagicLink.isPending}
						className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
					>
						{sendMagicLink.isPending ? "Sending..." : "Send sign-in link"}
					</button>
				</form>
			</div>
		</div>
	);
}
