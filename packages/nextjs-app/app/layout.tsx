import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import EntryWrapper from "./entry-wrapper";

// const geistSans = Geist({
// 	variable: "--font-geist-sans",
// 	subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
// 	variable: "--font-geist-mono",
// 	subsets: ["latin"],
// });

export const metadata: Metadata = {
	title: "Dify Chat Next",
	description: "更贴近业务的 Dify Web APP",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
			// className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<EntryWrapper>{children}</EntryWrapper>
			</body>
		</html>
	);
}
