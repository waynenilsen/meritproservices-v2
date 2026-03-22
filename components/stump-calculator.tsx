"use client";

import { Minus, Phone, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

const BASE_FEE = 150;
const PER_FOOT = 50;

interface Stump {
	id: number;
	diameter: number;
}

function formatFeet(value: number) {
	const whole = Math.floor(value);
	const hasHalf = value % 1 !== 0;
	if (whole === 0 && hasHalf) return "\u00BD";
	if (hasHalf) return `${whole}\u00BD`;
	return `${whole}`;
}

export function StumpCalculator() {
	const nextId = useRef(1);
	const [stumps, setStumps] = useState<Stump[]>([{ id: 0, diameter: 1 }]);

	const total =
		BASE_FEE + stumps.reduce((sum, s) => sum + s.diameter * PER_FOOT, 0);

	function addStump() {
		setStumps((prev) => [...prev, { id: nextId.current++, diameter: 1 }]);
	}

	function removeStump(id: number) {
		setStumps((prev) => prev.filter((s) => s.id !== id));
	}

	function updateDiameter(id: number, value: number) {
		const clamped = Math.max(0.5, Math.min(6, value));
		setStumps((prev) =>
			prev.map((s) => (s.id === id ? { ...s, diameter: clamped } : s)),
		);
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
								onClick={() => updateDiameter(stump.id, stump.diameter - 0.5)}
								disabled={stump.diameter <= 0.5}
								aria-label="Decrease diameter"
							>
								<Minus className="h-4 w-4" />
							</button>

							<div className="flex w-16 flex-col items-center justify-center sm:w-20">
								<span className="font-[family-name:var(--font-display)] text-xl font-extrabold text-[#FAF9F6] sm:text-2xl">
									{formatFeet(stump.diameter)}
								</span>
								<span className="text-[10px] font-medium uppercase tracking-wider text-[#FAF9F6]/40 sm:text-xs">
									feet
								</span>
							</div>

							<button
								type="button"
								className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FAF9F6]/10 text-[#FAF9F6] transition-colors hover:bg-[#FAF9F6]/20 active:bg-[#FAF9F6]/25 disabled:opacity-30 sm:h-10 sm:w-10"
								onClick={() => updateDiameter(stump.id, stump.diameter + 0.5)}
								disabled={stump.diameter >= 6}
								aria-label="Increase diameter"
							>
								<Plus className="h-4 w-4" />
							</button>
						</div>

						{/* Per-stump cost */}
						<span className="ml-auto font-[family-name:var(--font-display)] text-base font-bold text-[#FAF9F6]/60 sm:text-lg">
							${stump.diameter * PER_FOOT}
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
			>
				<Plus className="h-4 w-4" />
				Add another stump
			</button>

			{/* Pricing breakdown */}
			<div className="mt-6 space-y-2">
				<div className="flex items-center justify-between text-sm text-[#FAF9F6]/50">
					<span>Trip fee</span>
					<span className="font-medium">$150</span>
				</div>
				<div className="flex items-center justify-between text-sm text-[#FAF9F6]/50">
					<span>
						Grinding ({stumps.length} stump{stumps.length !== 1 ? "s" : ""})
					</span>
					<span className="font-medium">
						${stumps.reduce((sum, s) => sum + s.diameter * PER_FOOT, 0)}
					</span>
				</div>
				<div className="h-px bg-[#FAF9F6]/10" />
				<div className="flex items-baseline justify-between">
					<span className="text-sm font-semibold text-[#FAF9F6]/70">
						Estimated Total
					</span>
					<span className="font-[family-name:var(--font-display)] text-4xl font-extrabold text-[#D4A843] sm:text-5xl">
						${total}
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
