"use client";

import { Phone, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BASE_FEE = 150;
const PER_FOOT = 50;

interface Stump {
	id: number;
	diameter: number;
}

export function StumpCalculator({ isMobile }: { isMobile: boolean }) {
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

	function formatFeet(value: number) {
		const whole = Math.floor(value);
		const hasHalf = value % 1 !== 0;
		if (whole === 0 && hasHalf) return "\u00BD";
		if (hasHalf) return `${whole}\u00BD`;
		return `${whole}`;
	}

	function updateDiameter(id: number, value: number) {
		const clamped = Math.max(0.5, Math.min(6, value));
		setStumps((prev) =>
			prev.map((s) => (s.id === id ? { ...s, diameter: clamped } : s)),
		);
	}

	return (
		<div
			className={cn(
				"rounded-xl border border-[#FAF9F6]/10 bg-[#FAF9F6]/10 backdrop-blur-sm",
				isMobile ? "p-4" : "p-5",
			)}
		>
			<h3
				className={cn(
					"font-[family-name:var(--font-display)] font-bold text-[#FAF9F6]",
					isMobile ? "text-lg" : "text-xl",
				)}
			>
				Estimate Your Cost
			</h3>

			<div
				className={cn(
					"mt-3 flex items-center justify-between text-[#FAF9F6]/50",
					isMobile ? "text-xs" : "text-sm",
				)}
			>
				<span>Trip fee</span>
				<span className="font-medium text-[#FAF9F6]/70">$150</span>
			</div>

			<div className="my-3 h-px bg-[#FAF9F6]/10" />

			<div className={cn("flex flex-col", isMobile ? "gap-2" : "gap-3")}>
				{stumps.map((stump, index) => (
					<div key={stump.id} className="flex items-center gap-2">
						<span
							className={cn(
								"shrink-0 font-medium text-[#FAF9F6]/70",
								isMobile ? "w-16 text-xs" : "w-18 text-sm",
							)}
						>
							Stump {index + 1}
						</span>

						<div className="flex items-center gap-1">
							<Button
								size="icon-xs"
								className="border-[#FAF9F6]/20 bg-[#FAF9F6]/10 text-[#FAF9F6] hover:bg-[#FAF9F6]/20"
								onClick={() => updateDiameter(stump.id, stump.diameter - 0.5)}
								disabled={stump.diameter <= 0.5}
								aria-label="Decrease diameter"
							>
								−
							</Button>
							<span className="w-14 text-center text-sm font-semibold text-[#FAF9F6]">
								{formatFeet(stump.diameter)} ft
							</span>
							<Button
								size="icon-xs"
								className="border-[#FAF9F6]/20 bg-[#FAF9F6]/10 text-[#FAF9F6] hover:bg-[#FAF9F6]/20"
								onClick={() => updateDiameter(stump.id, stump.diameter + 0.5)}
								disabled={stump.diameter >= 6}
								aria-label="Increase diameter"
							>
								+
							</Button>
						</div>

						<span className="ml-auto text-sm font-medium text-[#FAF9F6]/50">
							${stump.diameter * PER_FOOT}
						</span>

						{stumps.length > 1 && (
							<Button
								size="icon-xs"
								className="text-[#FAF9F6]/40 hover:bg-red-500/20 hover:text-red-300"
								onClick={() => removeStump(stump.id)}
								aria-label={`Remove stump ${index + 1}`}
							>
								<Trash2 className="h-3 w-3" />
							</Button>
						)}
					</div>
				))}
			</div>

			<Button
				size="sm"
				className="mt-3 w-full border-dashed border-[#FAF9F6]/20 bg-transparent text-[#FAF9F6]/60 hover:bg-[#FAF9F6]/10 hover:text-[#FAF9F6]"
				onClick={addStump}
			>
				<Plus className="h-3.5 w-3.5" />
				Add a stump
			</Button>

			<div className="my-3 h-px bg-[#FAF9F6]/10" />

			<div className="flex items-baseline justify-between">
				<span className="text-sm font-medium text-[#FAF9F6]/70">
					Estimated Total
				</span>
				<span className="font-[family-name:var(--font-display)] text-3xl font-extrabold text-[#D4A843]">
					${total}
				</span>
			</div>

			<a
				href="tel:6033331505"
				className={cn(
					"mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#D4A843] font-bold text-[#2A3C2A] transition-colors hover:bg-[#E0B955]",
					isMobile ? "px-4 py-2.5 text-sm" : "px-6 py-3 text-sm",
				)}
			>
				<Phone className="h-4 w-4" />
				Call for Your Quote
			</a>
		</div>
	);
}
