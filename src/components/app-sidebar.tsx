"use client";

import * as React from "react";
import {
	IconDashboard,
	IconHelp,
	IconSearch,
	IconSettings,
	IconUserCheck,
} from "@tabler/icons-react";
import {
	ChevronDown,
	Building2,
	Bot,
	Users,
	BarChart3,
	MapPin,
	Edit,
	Building,
	Share2,
	Bell,
	Database,
	List,
	Heart,
	Calendar,
	TrendingUp,
	MousePointer,
	Facebook,
	UserPlus,
	Home,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import Link from "next/link";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "./ui/collapsible";
import { usePathname, useSearchParams } from "next/navigation";

const navigationItems = [
	{
		id: "users",
		label: "Users",
		icon: Users,
		children: [
			{ label: "Users List", icon: List, href: "/admin/users" },
			{
				label: "Wishlist",
				icon: Heart,
				href: "/admin/wishlist",
			},
			{ label: "Tours", icon: Calendar, href: "/admin/tours" },
		],
	},
	{
		id: "properties",
		label: "Properties",
		icon: Building2,
		children: [
			{ label: "Properties List", icon: List, href: "/admin/properties" },
			{ label: "Cities", icon: MapPin, href: "/admin/properties/cities" },

			{
				label: "Communities",
				icon: Building,
				href: "/admin/properties/communities",
			},
		],
	},
	{
		id: "automation",
		label: "Automation",
		icon: Bot,
		children: [
			{
				label: "Social Media",
				icon: Share2,
				href: "/admin/automation?tab=social",
			},
			{
				label: "Notifications",
				icon: Bell,
				href: "/admin/notifications",
			},
			{
				label: "MLS",
				icon: Database,
				href: "/admin/automation?tab=mls",
			},
		],
	},

	{
		id: "reports",
		label: "Reports",
		icon: BarChart3,
		children: [
			{
				label: "Property Performance",
				icon: TrendingUp,
				href: "/admin/performance?tab=properties",
			},
			{
				label: "Notification",
				icon: MousePointer,
				href: "/admin/notifications",
			},
			{
				label: "Social Media",
				icon: Facebook,
				href: "/admin/performance?tab=social",
			},
			{
				label: "Tour Requests",
				icon: Calendar,
				href: "/admin/tours",
			},
			{
				label: "New Users",
				icon: UserPlus,
				href: "/admin/users",
			},
		],
	},
];

const data = {
	user: {
		name: "Dimitri Schwarz",
		email: "",
		avatar: "",
	},
	navMain: [
		{
			title: "Dashboard",
			url: "/admin/dashboard",
			icon: IconDashboard,
		},
		{
			title: "Leads",
			url: "/admin/leads",
			icon: IconUserCheck,
		},
		{
			title: "Contact Requests",
			url: "/admin/contact-requests",
			icon: IconUserCheck,
		},
	],

	navSecondary: [
		{
			title: "Settings",
			url: "/admin/settings",
			icon: IconSettings,
		},
		{
			title: "Get Help",
			url: "/admin/help",
			icon: IconHelp,
		},
		{
			title: "Search",
			url: "/admin/search",
			icon: IconSearch,
		},
	],
};

const NavItems = () => {
	const path = usePathname();
	const searchParams = useSearchParams();
	const tab = searchParams.get("tab");

	const isActive = (item: { label: string; href: string }) => {
		// De-duplicate active highlights first
		if (item.href === "/admin/users" && item.label !== "Users List") return false;
		if (item.href === "/admin/tours" && item.label !== "Tours") return false;

		if (item.href.startsWith("/admin/automation")) {
			if (item.label === "Social Media") {
				return path === "/admin/automation" && tab === "social";
			}
			if (item.label === "MLS") {
				return path === "/admin/automation" && (tab === "mls" || !tab);
			}
		}

		if (item.href.startsWith("/admin/performance")) {
			if (item.label === "Social Media") {
				return path === "/admin/performance" && tab === "social";
			}
			if (item.label === "Property Performance") {
				return path === "/admin/performance" && (tab === "properties" || !tab);
			}
		}

		// Path hierarchy prefix check
		if (path === item.href) return true;
		if (item.href === "/admin/users" && path.startsWith("/admin/users/")) return true;
		if (item.href === "/admin/tours" && path.startsWith("/admin/tours/")) return true;
		if (item.href === "/admin/properties" && path.startsWith("/admin/properties/")) {
			if (path.startsWith("/admin/properties/cities") || path.startsWith("/admin/properties/communities")) {
				return false;
			}
			return true;
		}
		if (item.href === "/admin/properties/cities" && path.startsWith("/admin/cities/")) return true;
		if (item.href === "/admin/properties/communities" && path.startsWith("/admin/communities/")) return true;

		return false;
	};
	return navigationItems.map((navitem, index) => (
		<Collapsible
			key={index}
			defaultOpen
			className="group/collapsible">
			<SidebarGroup>
				<SidebarGroupLabel asChild>
					<CollapsibleTrigger>
						{navitem.label}
						<ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
					</CollapsibleTrigger>
				</SidebarGroupLabel>
				<CollapsibleContent>
					<SidebarGroupContent>
						<SidebarMenu>
							{navitem.children?.map((item) => (
								<SidebarMenuItem key={item.label}>
									<SidebarMenuButton
										isActive={isActive(item)}
										asChild>
										<Link href={item.href}>
											<item.icon />
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</CollapsibleContent>
			</SidebarGroup>
		</Collapsible>
	));
};

export function AppSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5">
							<a href="#">
								<Home className="!size-5" />
								<span className="text-base font-semibold">
									Gulfshore Group
								</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<NavItems />
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
