"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";

export default function Home() {
	const trpc = useTRPC();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: user, isLoading } = useQuery(trpc.auth.me.queryOptions());
	const logout = useMutation(trpc.auth.logout.mutationOptions());

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-gray-500">Loading...</p>
			</div>
		);
	}

	if (!user) {
		router.push("/login");
		return null;
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center space-y-4">
				<h1 className="text-2xl font-semibold">Welcome</h1>
				<p className="text-gray-600">{user.email}</p>
				<button
					type="button"
					onClick={async () => {
						await logout.mutateAsync();
						queryClient.clear();
						router.push("/login");
					}}
					className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
				>
					Sign out
				</button>
			</div>
		</div>
	);
}
