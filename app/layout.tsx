import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const manrope = Manrope({
	variable: "--font-sans",
	subsets: ["latin"],
});

const fraunces = Fraunces({
	variable: "--font-display",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Merit Pro Services | Stump Grinding",
	description:
		"Professional stump grinding services in New Hampshire. Call 603-333-1505 for a free quote.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${manrope.variable} ${fraunces.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#2C2C2C] font-sans">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
