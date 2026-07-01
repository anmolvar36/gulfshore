"use client";

import Link from "next/link";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Eye, Trash } from "lucide-react";
import { use, useEffect, useState } from "react";
import axios from "axios";

interface User {
	_id: string;
	clerkId: string;
	email: string;
	name: string;
	firstName: string;
	lastName: string;
	profileImage: string;
	isActive: boolean;
}

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>();

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const res = await axios.get(
					"/api/admin/users"
				);

				setUsers(res.data.users);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};
		fetchUsers();
	}, []);

	const viewUserDetails = (userId: string) => {
		// Open in a new tab
		window.open(`/admin/users/${userId}`, "_blank");
	};

	return (
		<div className="space-y-6 px-4 my-5">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Users</h1>
			</div>

			<div className="flex items-center gap-2">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search users..."
						className="pl-8"
					/>
				</div>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>User</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Actions</TableHead>
							<TableHead className="w-[80px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users?.map((user) => (
							<TableRow key={user._id}>
								<TableCell>
									<div className="flex items-center gap-3">
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={user.profileImage}
												alt={user.name}
											/>
											<AvatarFallback>
												{user.name.charAt(0)}
												{user.name.split(" ")[1]?.charAt(0)}
											</AvatarFallback>
										</Avatar>
										<div>
											<div className="font-medium">{user.name}</div>
											<div className="text-sm text-muted-foreground">
												{user.email}
											</div>
										</div>
									</div>
								</TableCell>
								<TableCell>
									<Badge
										variant={user.isActive ? "default" : "secondary"}>
										{user.isActive ? "Active" : "Inactive"}
									</Badge>
								</TableCell>
								<TableCell>{user.email}</TableCell>

								<TableCell>
									<Link
										className="items-center border px-2 hover:bg-black hover:text-white py-1 rounded-lg shadow inline-flex"
										href={`/admin/users/${user._id}`}>
										<Eye className="mr-2 h-4 w-4" />
										View Details
									</Link>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
