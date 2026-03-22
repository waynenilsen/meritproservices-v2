import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
	variable: "--font-display",
	subsets: ["latin"],
	weight: ["400", "700", "800"],
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
			className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#2C2C2C] font-sans">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
