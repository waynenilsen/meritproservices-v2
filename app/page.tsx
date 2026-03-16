"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export default function Home() {
	const trpc = useTRPC();
	const { data: session, isLoading } = useQuery(trpc.auth.me.queryOptions());

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-gray-500">Loading...</p>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center space-y-4">
				<h1 className="text-2xl font-semibold">Welcome</h1>
				{session?.email ? (
					<p className="text-gray-600">{session.email}</p>
				) : (
					<div className="space-y-2">
						<p className="text-gray-500">You&apos;re browsing anonymously</p>
						<a
							href="/login"
							className="inline-block rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
						>
							Sign in with email
						</a>
					</div>
				)}
			</div>
		</div>
	);
}
