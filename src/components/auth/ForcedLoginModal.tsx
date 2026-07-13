"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Bell, ShieldCheck, Home, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ForcedLoginModal() {
	const { isSignedIn, isLoaded } = useUser();
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (!isLoaded || isSignedIn) {
			setIsOpen(false);
			return;
		}

		// Don't show on auth pages or admin pages
		if (
			pathname.includes("/signup") ||
			pathname.includes("/signin") ||
			pathname.includes("/sign-up") ||
			pathname.includes("/sign-in") ||
			pathname.startsWith("/admin")
		) {
			setIsOpen(false);
			return;
		}

		// Track property views in localStorage
		const viewsKey = "gulfshore_property_views";
		const currentViews = Number(localStorage.getItem(viewsKey) || "0");
		const newViews = currentViews + 1;
		localStorage.setItem(viewsKey, newViews.toString());

		// If user has viewed 2 or more properties, or is on a detail page, trigger modal after brief delay
		const isDetailPage = pathname.includes("/Florida-Real-Estate-Listings/");
		if (newViews >= 3 || isDetailPage) {
			const timer = setTimeout(() => {
				setIsOpen(true);
			}, 4000);
			return () => clearTimeout(timer);
		}
	}, [isLoaded, isSignedIn, pathname]);

	if (!isOpen || isSignedIn) return null;

	return (
		<Dialog open={isOpen}>
			<DialogContent 
				onInteractOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
				className="sm:max-w-[480px] p-0 overflow-hidden bg-white rounded-3xl border-0 shadow-2xl [&>button]:hidden"
			>
				{/* Top Header Banner */}
				<div className="relative bg-gradient-to-br from-red-600 via-red-700 to-rose-900 p-8 text-white text-center">
					<div className="mx-auto w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-inner">
						<Home className="w-8 h-8 text-white" />
					</div>
					<DialogTitle className="text-2xl font-extrabold tracking-tight mb-2">
						Unlock Full MLS VIP Access
					</DialogTitle>
					<DialogDescription className="text-red-100 text-sm max-w-xs mx-auto leading-relaxed">
						Join Gulfshore Group to unlock high-resolution photos, price history, and instant property alerts.
					</DialogDescription>
				</div>

				{/* Benefits Section */}
				<div className="p-6 space-y-4">
					<div className="space-y-3">
						<div className="flex items-start gap-3 p-3 bg-red-50/60 rounded-xl border border-red-100">
							<Bell className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
							<div>
								<h4 className="text-sm font-semibold text-gray-900">
									Instant Email &amp; SMS Alerts
								</h4>
								<p className="text-xs text-gray-600">
									Be the first to know when new luxury listings matching your criteria hit the market.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
							<Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
							<div>
								<h4 className="text-sm font-semibold text-gray-900">
									Exclusive NABOR MLS Data
								</h4>
								<p className="text-xs text-gray-600">
									View unredacted property prices, HOA fees, and neighborhood WalkScores.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
							<ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
							<div>
								<h4 className="text-sm font-semibold text-gray-900">
									Save Searches &amp; Favorites
								</h4>
								<p className="text-xs text-gray-600">
									Bookmark dream homes and receive automated price drop notifications.
								</p>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="pt-2 space-y-3">
						<Link href="/signup" onClick={() => setIsOpen(false)} className="w-full block">
							<Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-base cursor-pointer">
								Create Free Account
								<ArrowRight className="w-5 h-5" />
							</Button>
						</Link>

						<Link href="/signin" onClick={() => setIsOpen(false)} className="w-full block">
							<Button
								variant="outline"
								className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-5 rounded-xl text-sm cursor-pointer">
								Already have an account? Sign In
							</Button>
						</Link>
					</div>

					<p className="text-[11px] text-center text-gray-400 pt-2">
						Free &amp; secure registration. No spam guarantee.
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
