"use client";

import { Minus, Phone, Plus, Trash2 } from "lucide-react";
import { PER_HALF_FOOT_CENTS, TRIP_FEE_CENTS, computeTotal } from "@/lib/job";
import { trpc } from "@/lib/trpc";

interface LineItemData {
	id: string;
	description: string;
	quantity: number;
	unitPrice: number;
	amount: number;
	sortOrder: number;
}

interface StumpCalculatorProps {
	jobId: string | null;
	initialLineItems: LineItemData[];
}

function formatDiameter(halfFeet: number) {
	const feet = halfFeet / 2;
	const whole = Math.floor(feet);
	const hasHalf = feet % 1 !== 0;
	if (whole === 0 && hasHalf) return "\u00BD";
	if (hasHalf) return `${whole}\u00BD`;
	return `${whole}`;
}

function centsToDisplay(cents: number) {
	return `$${Math.round(cents / 100)}`;
}

export function StumpCalculator({
	jobId,
	initialLineItems,
}: StumpCalculatorProps) {
	const utils = trpc.useUtils();

	const { data: jobData } = trpc.job.get.useQuery(
		{ jobId: jobId ?? "" },
		{ enabled: !!jobId },
	);

	const lineItems: LineItemData[] = jobData?.lineItems ?? initialLineItems;
	const tripFee = lineItems.find((li) => li.description === "Trip fee");
	const stumps = lineItems.filter((li) => li.description === "Stump grinding");
	const total = computeTotal(lineItems);

	const invalidate = () => {
		if (jobId) utils.job.get.invalidate({ jobId });
	};

	const addMutation = trpc.job.addLineItem.useMutation({
		onSuccess: invalidate,
	});
	const updateMutation = trpc.job.updateLineItem.useMutation({
		onSuccess: invalidate,
	});
	const removeMutation = trpc.job.removeLineItem.useMutation({
		onSuccess: invalidate,
	});

	function addStump() {
		if (!jobId) return;
		addMutation.mutate({
			jobId,
			description: "Stump grinding",
			quantity: 2,
			unitPrice: PER_HALF_FOOT_CENTS,
		});
	}

	function removeStump(lineItemId: string) {
		removeMutation.mutate({ lineItemId });
	}

	function updateDiameter(
		lineItemId: string,
		currentQty: number,
		delta: number,
	) {
		const newQty = currentQty + delta;
		if (newQty < 1 || newQty > 12) return;
		updateMutation.mutate({ lineItemId, quantity: newQty });
	}

	return (
		<div className="w-full">
			{/* Stump list */}
			<div className="flex flex-col gap-3">
				{stumps.map((stump, index) => (
					<div
						key={stump.id}
						className="flex items-center gap-3 rounded-xl bg-[#1E2E1E] p-3 sm:p-4"
					>
						{/* Stump label */}
						<div className="min-w-0 shrink-0">
							<span className="text-xs font-semibold uppercase tracking-wider text-[#FAF9F6]/40">
								Stump {index + 1}
							</span>
						</div>

						{/* Diameter controls — big tap targets */}
						<div className="flex items-center gap-1 sm:gap-2">
							<button
								type="button"
								className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FAF9F6]/10 text-[#FAF9F6] transition-colors hover:bg-[#FAF9F6]/20 active:bg-[#FAF9F6]/25 disabled:opacity-30 sm:h-10 sm:w-10"
								onClick={() => updateDiameter(stump.id, stump.quantity, -1)}
								disabled={stump.quantity <= 1}
								aria-label="Decrease diameter"
							>
								<Minus className="h-4 w-4" />
							</button>

							<div className="flex w-16 flex-col items-center justify-center sm:w-20">
								<span className="font-[family-name:var(--font-display)] text-xl font-extrabold text-[#FAF9F6] sm:text-2xl">
									{formatDiameter(stump.quantity)}
								</span>
								<span className="text-[10px] font-medium uppercase tracking-wider text-[#FAF9F6]/40 sm:text-xs">
									feet
								</span>
							</div>

							<button
								type="button"
								className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FAF9F6]/10 text-[#FAF9F6] transition-colors hover:bg-[#FAF9F6]/20 active:bg-[#FAF9F6]/25 disabled:opacity-30 sm:h-10 sm:w-10"
								onClick={() => updateDiameter(stump.id, stump.quantity, 1)}
								disabled={stump.quantity >= 12}
								aria-label="Increase diameter"
							>
								<Plus className="h-4 w-4" />
							</button>
						</div>

						{/* Per-stump cost */}
						<span className="ml-auto font-[family-name:var(--font-display)] text-base font-bold text-[#FAF9F6]/60 sm:text-lg">
							{centsToDisplay(stump.amount)}
						</span>

						{/* Remove button */}
						{stumps.length > 1 && (
							<button
								type="button"
								className="flex h-11 w-11 items-center justify-center rounded-lg text-[#FAF9F6]/30 transition-colors hover:bg-red-500/20 hover:text-red-400 active:bg-red-500/30 sm:h-10 sm:w-10"
								onClick={() => removeStump(stump.id)}
								aria-label={`Remove stump ${index + 1}`}
							>
								<Trash2 className="h-4 w-4" />
							</button>
						)}
					</div>
				))}
			</div>

			{/* Add stump */}
			<button
				type="button"
				className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#FAF9F6]/15 text-sm font-semibold text-[#FAF9F6]/50 transition-colors hover:border-[#FAF9F6]/30 hover:text-[#FAF9F6]/80 active:bg-[#FAF9F6]/5 sm:h-11"
				onClick={addStump}
				disabled={!jobId || addMutation.isPending}
			>
				<Plus className="h-4 w-4" />
				Add another stump
			</button>

			{/* Pricing breakdown */}
			<div className="mt-6 space-y-2">
				<div className="flex items-center justify-between text-sm text-[#FAF9F6]/50">
					<span>Trip fee</span>
					<span className="font-medium">
						{centsToDisplay(tripFee?.amount ?? TRIP_FEE_CENTS)}
					</span>
				</div>
				<div className="flex items-center justify-between text-sm text-[#FAF9F6]/50">
					<span>
						Grinding ({stumps.length} stump{stumps.length !== 1 ? "s" : ""})
					</span>
					<span className="font-medium">
						{centsToDisplay(computeTotal(stumps))}
					</span>
				</div>
				<div className="h-px bg-[#FAF9F6]/10" />
				<div className="flex items-baseline justify-between">
					<span className="text-sm font-semibold text-[#FAF9F6]/70">
						Estimated Total
					</span>
					<span className="font-[family-name:var(--font-display)] text-4xl font-extrabold text-[#D4A843] sm:text-5xl">
						{centsToDisplay(total)}
					</span>
				</div>
			</div>

			{/* CTA */}
			<a
				href="tel:6033331505"
				className="mt-6 flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-[#D4A843] text-base font-bold text-[#2A3C2A] transition-colors hover:bg-[#E0B955] active:bg-[#C49A3A] sm:h-12 sm:text-sm"
			>
				<Phone className="h-5 w-5 sm:h-4 sm:w-4" />
				Call for Your Free Quote
			</a>

			{/* Skip the calculator option */}
			<div className="mt-5 rounded-xl border border-[#FAF9F6]/10 bg-[#FAF9F6]/[0.03] px-4 py-4">
				<p className="text-center text-sm leading-relaxed text-[#FAF9F6]/60">
					Don&apos;t feel like measuring?{" "}
					<a
						href="tel:6033331505"
						className="inline font-semibold text-[#D4A843] underline decoration-[#D4A843]/30 underline-offset-2 transition-colors hover:text-[#E0B955]"
					>
						Just give us a call
					</a>{" "}
					&mdash; we&apos;ll come out, measure everything, and give you a price
					on the spot. No charge.
				</p>
			</div>
		</div>
	);
}
