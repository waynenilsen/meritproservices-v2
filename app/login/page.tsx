"use client";

import {
	startAuthentication,
	startRegistration,
} from "@simplewebauthn/browser";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [mode, setMode] = useState<"login" | "register">("login");
	const trpc = useTRPC();

	const registerOptions = useMutation(
		trpc.auth.registerOptions.mutationOptions(),
	);
	const registerVerify = useMutation(
		trpc.auth.registerVerify.mutationOptions(),
	);
	const loginOptions = useMutation(trpc.auth.loginOptions.mutationOptions());
	const loginVerify = useMutation(trpc.auth.loginVerify.mutationOptions());

	const isLoading =
		registerOptions.isPending ||
		registerVerify.isPending ||
		loginOptions.isPending ||
		loginVerify.isPending;

	async function handleRegister(e: React.FormEvent) {
		e.preventDefault();
		setError("");

		try {
			const { options, userId } = await registerOptions.mutateAsync({ email });
			const response = await startRegistration({ optionsJSON: options });
			await registerVerify.mutateAsync({ userId, response });
			window.location.href = "/";
		} catch (err) {
			setError(err instanceof Error ? err.message : "Registration failed");
		}
	}

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault();
		setError("");

		try {
			const { options, userId } = await loginOptions.mutateAsync({ email });
			const response = await startAuthentication({ optionsJSON: options });
			await loginVerify.mutateAsync({ userId, response });
			window.location.href = "/";
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50">
			<div className="w-full max-w-sm space-y-6 p-8">
				<div className="text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						{mode === "login" ? "Sign in" : "Create account"}
					</h1>
					<p className="mt-2 text-sm text-gray-500">
						{mode === "login"
							? "Sign in with your passkey"
							: "Register a new passkey"}
					</p>
				</div>

				<form
					onSubmit={mode === "login" ? handleLogin : handleRegister}
					className="space-y-4"
				>
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

					{error && <p className="text-sm text-red-600">{error}</p>}

					<button
						type="submit"
						disabled={isLoading}
						className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
					>
						{isLoading
							? "Please wait..."
							: mode === "login"
								? "Sign in with passkey"
								: "Register passkey"}
					</button>
				</form>

				<div className="text-center text-sm text-gray-500">
					{mode === "login" ? (
						<>
							No account?{" "}
							<button
								type="button"
								onClick={() => {
									setMode("register");
									setError("");
								}}
								className="font-medium text-black hover:underline"
							>
								Register
							</button>
						</>
					) : (
						<>
							Already registered?{" "}
							<button
								type="button"
								onClick={() => {
									setMode("login");
									setError("");
								}}
								className="font-medium text-black hover:underline"
							>
								Sign in
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
