"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export default function Home() {
	const trpc = useTRPC();
	const { data, isLoading } = useQuery(trpc.time.queryOptions());

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="text-2xl font-semibold mb-4">Server Time</h1>
				{isLoading ? (
					<p className="text-gray-500">Loading...</p>
				) : (
					<p className="text-lg font-mono">
						{data?.serverTime.toLocaleString()}
					</p>
				)}
			</div>
		</div>
	);
}
