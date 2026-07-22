"use client";

import {
	IconCirclePlusFilled,
	IconMail,
	type Icon,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon?: Icon;
	}[];
}) {
	const router = useRouter();
	const path = usePathname();

	const isActive = (url: string) => {
		if (path === url) return true;
		if (url === "/admin/leads" && path.startsWith("/admin/leads/")) return true;
		if (url === "/admin/contact-requests" && path.startsWith("/admin/contact-requests/")) return true;
		return false;
	};

	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					<SidebarMenuItem className="flex flex-row items-center gap-2 px-1">
						<SidebarMenuButton
							tooltip="Quick Create"
							className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary/90 focus:text-primary-foreground font-semibold justify-center shadow-sm">
							<IconCirclePlusFilled className="size-5 mr-1 shrink-0" />
							<span className="truncate">Quick Create</span>
						</SidebarMenuButton>
						<Button
							size="icon"
							variant="outline"
							className="h-8 w-8 shrink-0 text-primary border-primary/20 hover:bg-primary/10">
							<IconMail size={16} />
							<span className="sr-only">Inbox</span>
						</Button>
					</SidebarMenuItem>
				</SidebarMenu>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								isActive={isActive(item.url)}
								onClick={() => router.push(item.url)}
								tooltip={item.title}
								asChild>
								<Link href={item.url}>
									{item.icon && <item.icon className="size-5 shrink-0" />}
									<span className="truncate">{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
