import { Phone, Shield, Shovel, TreeDeciduous } from "lucide-react";
import { cookies } from "next/headers";
import { StumpCalculator } from "@/components/stump-calculator";
import { getOrCreateDraftJob } from "@/lib/job";
import { prisma } from "@/lib/prisma";
import { getSessionById, isSessionValid, SESSION_COOKIE } from "@/lib/session";

async function getDraftJob() {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
	if (!sessionId) return null;

	const session = await getSessionById(prisma, sessionId);
	if (!session || !isSessionValid(session)) return null;

	return getOrCreateDraftJob(prisma, session.userId);
}

export default async function Home() {
	const job = await getDraftJob();

	return (
		<div className="flex flex-1 flex-col">
			{/* Header */}
			<header className="sticky top-0 z-10 border-b border-[#2A3C2A]/10 bg-[#FAF9F6]/95 backdrop-blur-sm">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#2A3C2A]">
							<TreeDeciduous className="h-4 w-4 text-[#D4A843]" />
						</div>
						<span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-[#2A3C2A]">
							Merit Pro Services
						</span>
					</div>
					<a
						href="tel:6033331505"
						className="flex h-11 items-center gap-2 rounded-full bg-[#2A3C2A] px-5 py-2.5 text-sm font-semibold text-[#FAF9F6] transition-colors hover:bg-[#3D5A3D] active:bg-[#4A6A4A]"
					>
						<Phone className="h-3.5 w-3.5" />
						<span className="hidden sm:inline">(603) 333-1505</span>
						<span className="sm:hidden">Call</span>
					</a>
				</div>
			</header>

			{/* Hero — calculator is the star */}
			<section className="relative overflow-hidden bg-[#2A3C2A]">
				<div
					className="absolute inset-0 opacity-[0.03]"
					style={{
						backgroundImage:
							"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
					}}
				/>
				<div className="relative mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-20">
					{/* Headline */}
					<div className="mb-8 text-center sm:mb-10">
						<p className="font-[family-name:var(--font-display)] text-xs font-bold uppercase tracking-[0.25em] text-[#D4A843]">
							Stump Grinding · New Hampshire
						</p>
						<h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-extrabold leading-tight tracking-tight text-[#FAF9F6] sm:text-5xl">
							See What It&apos;ll Cost
						</h1>
						<p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#FAF9F6]/50 sm:text-base">
							Add your stumps, get an instant estimate, then call us to
							schedule.
						</p>
					</div>

					{/* Calculator */}
					{job ? (
						<StumpCalculator
							jobId={job.id}
							initialLineItems={job.lineItems.map((li) => ({
								id: li.id,
								description: li.description,
								quantity: li.quantity,
								unitPrice: li.unitPrice,
								amount: li.amount,
								sortOrder: li.sortOrder,
							}))}
							initialStatus={job.status}
						/>
					) : (
						<StumpCalculator
							jobId={null}
							initialLineItems={[]}
							initialStatus="draft"
						/>
					)}
				</div>
			</section>

			{/* How It Works */}
			<section className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
				<p className="font-[family-name:var(--font-display)] text-xs font-bold uppercase tracking-[0.2em] text-[#D4A843]">
					The Process
				</p>
				<h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[#2A3C2A] sm:text-4xl">
					Three Simple Steps
				</h2>

				<div className="mt-12 grid gap-8 sm:grid-cols-3">
					{[
						{
							num: "01",
							icon: TreeDeciduous,
							title: "Measure & Quote",
							desc: "We come out, measure your stumps, give you a final price, and mark the area for Dig Safe.",
						},
						{
							num: "02",
							icon: Shield,
							title: "Dig Safe",
							desc: "Dig Safe marks underground utilities — required by law before any grinding can begin.",
						},
						{
							num: "03",
							icon: Shovel,
							title: "Grind & Clean",
							desc: "We grind the stumps down and rake the wood chips back into the hole. Clean site when we leave.",
						},
					].map((step) => (
						<div key={step.num} className="group relative">
							<div className="flex items-start gap-4">
								<span className="font-[family-name:var(--font-display)] text-4xl font-extrabold text-[#2A3C2A]/10">
									{step.num}
								</span>
								<div className="pt-1">
									<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#2A3C2A]/5">
										<step.icon className="h-5 w-5 text-[#2A3C2A]" />
									</div>
									<h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[#2A3C2A]">
										{step.title}
									</h3>
									<p className="mt-2 text-sm leading-relaxed text-[#6B6B60]">
										{step.desc}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Divider */}
			<div className="mx-auto w-full max-w-5xl px-6">
				<div className="h-px bg-[#2A3C2A]/10" />
			</div>

			{/* Landscaping partner */}
			<section className="mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[#2A3C2A]">
							Need Landscaping After?
						</h2>
						<p className="mt-2 max-w-md text-[#6B6B60]">
							We work with a trusted landscaping partner and are happy to
							connect you for any follow-up work on your yard.
						</p>
					</div>
					<a
						href="tel:6033331505"
						className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-[#2A3C2A]/20 px-5 py-2.5 text-sm font-semibold text-[#2A3C2A] transition-colors hover:bg-[#2A3C2A]/5"
					>
						<Phone className="h-3.5 w-3.5" />
						Ask Us About It
					</a>
				</div>
			</section>

			{/* Footer */}
			<footer className="mt-auto border-t border-[#2A3C2A]/10 bg-[#2A3C2A]">
				<div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
					<div className="flex items-center gap-2 text-sm text-[#FAF9F6]/60">
						<TreeDeciduous className="h-4 w-4 text-[#D4A843]" />
						<span>&copy; {new Date().getFullYear()} Merit Pro Services</span>
					</div>
					<a
						href="tel:6033331505"
						className="text-sm font-medium text-[#FAF9F6]/80 transition-colors hover:text-[#FAF9F6]"
					>
						(603) 333-1505
					</a>
				</div>
			</footer>
		</div>
	);
}
