"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import Navbar from "@/components/global/nav";
import { Toaster } from "@/components/ui/sonner";
import { SignedOut } from "@clerk/nextjs";
import ShowGoogleSignInPopup from "@/hooks/googleOneTap";

const SignupPopUp = dynamic(() => import("@/components/home/signupPopUp"), {
	ssr: false,
});

export default function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Suspense fallback={<div className="h-16 bg-white border-b" />}>
				<Navbar />
			</Suspense>
			{children}
			
			<ShowGoogleSignInPopup />

			<Suspense>
				<Toaster richColors position="bottom-center" />
				<SignedOut>
					<SignupPopUp />
				</SignedOut>
			</Suspense>
		</>
	);
}
