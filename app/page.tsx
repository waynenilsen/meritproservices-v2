"use client";

import { trpc } from "@/lib/trpc";

export default function Home() {
	const hello = trpc.hello.useQuery();

	return (
		<div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-4 px-16 bg-white dark:bg-black">
				<h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
					{hello.data?.greeting ?? "Loading..."}
				</h1>
				{hello.data?.serverTime && (
					<p className="text-lg text-zinc-600 dark:text-zinc-400">
						Server time: {hello.data.serverTime.toLocaleString()}
					</p>
				)}
			</main>
		</div>
	);
}
