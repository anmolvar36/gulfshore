"use client";

import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "../ui/sheet";
import {
	HeartIcon,
	LucideMenu,
	Mail,
	Phone,
	Sparkles,
} from "lucide-react";

import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
	useUser,
} from "@clerk/nextjs";
import { usePathname, useSearchParams } from "next/navigation";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import Image from "next/image";

const Navbar = () => {
	const path = usePathname();
	const isHomePage = path === "/";
	const isSearchPage = path.startsWith("/Florida-Real-Estate-Search");

	const [isScrolled, setIsScrolled] = useState(false);
	const { user, isLoaded, isSignedIn } = useUser();

	const searchParams = useSearchParams();

	// Redirect admin users to admin panel ONLY right after fresh login in production
	useEffect(() => {
		if (isLoaded && isSignedIn && user?.publicMetadata?.role === "admin") {
			const justSignedIn = typeof sessionStorage !== "undefined"
				? sessionStorage.getItem("just_signed_in")
				: null;

			if (justSignedIn === "true") {
				sessionStorage.removeItem("just_signed_in");
				window.location.href = "/admin/dashboard";
			}
		}
	}, [isLoaded, isSignedIn, user]);

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const navBgClass = isHomePage
		? `text-white  absolute top-0 left-0 right-0 z-50 transition-all duration-300  backdrop-blur-md bg-white/95`
		: isSearchPage
		? "md:block bg-white/95 backdrop-blur-md  text-black shadow-sm border-b border-gray-200/50 min-h-[40px] md:min-h-[70px] h-14"
		: "bg-white/95 backdrop-blur-md  text-black shadow-sm border-b border-gray-200/50";

	const logoTextClass = isHomePage && "text-black";

	const menuIconClass = `transition-colors duration-300 text-black`;

	const navLinksClass = "";

	const headerClass = isHomePage
		? "fixed top-0 left-0 right-0 z-40"
		: "static";

	if (path === "/property-management") return null;

	return (
		<header className={headerClass}>
			<NavigationMenu
				className={`p-4 container justify-between max-w-full lg:px-12 flex items-center min-h-[70px] ${navBgClass}`}>
				<div className="flex justify-between w-full items-center">
					<Link
						href="/"
						className={`text-xs md:text-xl md:font-bold font-semibold tracking-tight hover:scale-105 transition-transform duration-200 ${logoTextClass}`}>
						<div className="flex flex-row item-center justify-center gap-2">
							<Image
								src={"/logored.svg"}
								alt="Gulfshoregroup"
								className="w-6 md:w-9"
								width={35}
								height={8}
							/>

							<div className="flex flex-col">
								<span className="text-primary">GULFSHORE GROUP</span>
								<span
									className={`text-gray-600 md:font-medium font-normal text-center md:text-sm text-[10px]`}>
									London Forster Realty
								</span>
							</div>
						</div>
					</Link>

					<div className="hidden lg:block">
						<NavigationMenuList
							className={`space-x-2 text-black ${navLinksClass}`}>
							{[
								{ path: "/", label: "Home" },
								{
									path: "/Florida-Real-Estate-Search",
									label: "Search",
								},
							].map(({ path: navPath, label }) => (
								<NavigationMenuItem key={navPath}>
									<NavigationMenuLink
										className="relative px-4 py-2 rounded-xl font-medium text-black hover:bg-white/10 transition-all duration-200 hover:scale-105"
										href={navPath}>
										{label}
										{path === navPath && (
											<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-1 bg-current rounded-full" />
										)}
									</NavigationMenuLink>
								</NavigationMenuItem>
							))}
							<NavigationMenuItem key={"call"}>
								<NavigationMenuLink
									className={`relative inline-flex text-center items-center gap-2 px-4 py-2 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 ${"hover:scale-105"}`}
									href={"tel:+1 239-992-9119"}>
									<Phone size={20} />
									+1 (239) 992-9119
								</NavigationMenuLink>
							</NavigationMenuItem>
							<NavigationMenuItem key={"mail"}>
								<NavigationMenuLink
									className={`relative inline-flex text-center items-center gap-2 px-4 py-2 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 ${"hover:scale-105"}`}
									href={"mailto:mailbox@gulfshoregroup.com"}>
									<Mail size={20} />
									E-mail Us
								</NavigationMenuLink>
							</NavigationMenuItem>
							<SignedOut>
								<NavigationMenuItem>
									<Link href="/admin/dashboard">
										<Button variant="outline" className="rounded-lg font-bold cursor-pointer border-[#B89A6A] text-[#B89A6A] hover:bg-[#B89A6A]/10">
											Admin Panel
										</Button>
									</Link>
								</NavigationMenuItem>
							</SignedOut>
							<SignedIn>
								<NavigationMenuItem>
									<div className="flex items-center gap-4">
										{user?.publicMetadata?.role === "admin" && (
											<Link href="/admin/dashboard">
												<Button variant="outline" className="rounded-lg font-bold cursor-pointer border-[#B89A6A] text-[#B89A6A] hover:bg-[#B89A6A]/10">
													Admin Panel
												</Button>
											</Link>
										)}
										<UserButton />
									</div>
								</NavigationMenuItem>
							</SignedIn>
						</NavigationMenuList>
					</div>
					{/* Mobile Actions */}
					<div className="flex items-center gap-3">
						<NavigationMenu className="lg:hidden flex items-center">
							<NavigationMenuList>
								<NavigationMenuItem key={"call"}>
									<NavigationMenuLink
										className={`relative text-sm inline-flex underline	 text-center items-center gap-1 p-2 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 ${"hover:scale-105"}`}
										href={"tel:+1 239-992-9119"}>
										<Phone size={20} />
									</NavigationMenuLink>
								</NavigationMenuItem>
								<NavigationMenuItem key={"mail"}>
									<NavigationMenuLink
										className={`relative text-sm inline-flex underline	 text-center items-center gap-1 p-2 rounded-xl font-medium hover:bg-white/10 transition-all duration-200 ${"hover:scale-105"}`}
										href={"mailto:mailbox@gulfshoregroup.com"}>
										<Mail size={20} />
									</NavigationMenuLink>
								</NavigationMenuItem>
							</NavigationMenuList>
						</NavigationMenu>
						<DrawerMenu menuIconClass={menuIconClass} />
					</div>
				</div>
			</NavigationMenu>
		</header>
	);
};

export default Navbar;

export const DrawerMenu = ({
	menuIconClass = "",
}: {
	menuIconClass?: string;
}) => {
	const path = usePathname();
	const { user } = useUser();

	return (
		<Sheet>
			<SheetTrigger
				className="rounded-xl p-2 hover:bg-white/10 transition-colors duration-200"
				style={{
					backdropFilter: "blur(10px)",
				}}
				aria-label="menu">
				<LucideMenu className={`w-6 h-6  ${menuIconClass}`} />
			</SheetTrigger>
			<SheetContent className="w-[300px] bg-white/95 backdrop-blur-xl border-l border-gray-200/50">
				<SheetClose />
				<SheetTitle className="text-2xl font-bold bg-clip-text text-gray-900">
					Gulfshore Group
				</SheetTitle>
				<NavigationMenu>
					<div className="flex flex-col pt-6 space-y-2">
						{[
							{ path: "/", label: "Home" },

							{
								path: "/Florida-Real-Estate-Search",
								label: "Search",
							},
							{ path: "/contact", label: "Contact" },
							{ path: "/about", label: "About" },
						].map(({ path: navPath, label }) => (
							<NavigationMenuLink
								key={navPath}
								href={navPath}
								className=" relative px-4 py-3 rounded-xl hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 font-medium">
								<span className="relative z-10">{label}</span>
								{path === navPath && (
									<div className="absolute inset-0 bg-linear-to-r from-blue-100 to-purple-100 rounded-xl" />
								)}
							</NavigationMenuLink>
						))}
						<SignedOut>
							<NavigationMenuLink
								href="/admin/dashboard"
								className="relative px-4 py-3 rounded-xl text-[#B89A6A] hover:bg-[#B89A6A]/10 transition-all duration-200 font-bold">
								<span>Admin Panel</span>
							</NavigationMenuLink>
						</SignedOut>
						<SignedIn>
							{" "}
							{user?.publicMetadata?.role === "admin" && (
								<NavigationMenuLink
									href="/admin/dashboard"
									className="relative px-4 py-3 rounded-xl text-[#B89A6A] hover:bg-[#B89A6A]/10 transition-all duration-200 font-bold">
									<span>Admin Dashboard</span>
								</NavigationMenuLink>
							)}
							<NavigationMenuLink
								href="https://gulfshoregroup.com/favorites"
								className="relative px-4 py-3 rounded-xl hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 font-medium">
								<span>Saved Properties</span>
							</NavigationMenuLink>
							<NavigationMenuLink
								href="https://gulfshoregroup.com/user/saved-searches"
								className="relative px-4 py-3 rounded-xl hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 font-medium">
								<span>Saved Searches</span>
							</NavigationMenuLink>
						</SignedIn>
					</div>
				</NavigationMenu>
			</SheetContent>
		</Sheet>
	);
};
