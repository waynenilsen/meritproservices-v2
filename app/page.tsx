"use client";

import { trpc } from "@/lib/trpc";

function statusBadge(status: string) {
	const colors: Record<string, string> = {
		active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
		completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
		archived: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
	};
	return (
		<span
			className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? colors.archived}`}
		>
			{status}
		</span>
	);
}

export default function Home() {
	const hello = trpc.hello.useQuery();
	const projects = trpc.projects.list.useQuery();

	return (
		<div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 px-16 py-12 bg-white dark:bg-black">
				<h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
					{hello.data?.greeting ?? "Loading..."}
				</h1>
				{hello.data?.serverTime && (
					<p className="text-lg text-zinc-600 dark:text-zinc-400">
						Server time: {hello.data.serverTime.toLocaleString()}
					</p>
				)}

				<div className="w-full">
					<h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
						Projects
					</h2>
					{projects.isLoading ? (
						<p className="text-zinc-500">Loading projects...</p>
					) : projects.data?.length === 0 ? (
						<p className="text-zinc-500">No projects found.</p>
					) : (
						<div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
							<table className="w-full text-left text-sm">
								<thead className="bg-zinc-50 dark:bg-zinc-900">
									<tr>
										<th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
											Name
										</th>
										<th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
											Description
										</th>
										<th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
											Status
										</th>
										<th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">
											Created
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
									{projects.data?.map((project) => (
										<tr
											key={project.id}
											className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
										>
											<td className="px-4 py-3 font-medium text-black dark:text-zinc-100">
												{project.name}
											</td>
											<td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
												{project.description ?? "—"}
											</td>
											<td className="px-4 py-3">
												{statusBadge(project.status)}
											</td>
											<td className="px-4 py-3 text-zinc-500 dark:text-zinc-500">
												{project.createdAt.toLocaleDateString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
