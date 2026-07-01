"use client";
import React, { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Calendar,
	Mail,
	Phone,
	Filter,
} from "lucide-react";

const getStatusColor = (status: string) => {
	switch (status?.toLowerCase()) {
		case "pending":
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
		case "confirmed":
			return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
		case "completed":
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case "cancelled":
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
	}
};

export default function ToursPage() {
	const [tourRequests, setTourRequests] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [propertySearch, setPropertySearch] = useState("");
	const [userSearch, setUserSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	useEffect(() => {
		const fetchTours = async () => {
			try {
				const res = await fetch("/api/admin/tours");
				const json = await res.json();
				if (json.success) {
					setTourRequests(json.tours);
				}
			} catch (e) {
				console.error("Error fetching tours:", e);
			} finally {
				setLoading(false);
			}
		};
		fetchTours();
	}, []);

	const filteredTours = tourRequests.filter((t) => {
		const matchProperty = (t.propertyAddress || "").toLowerCase().includes(propertySearch.toLowerCase());
		const matchUser = (t.userName || "").toLowerCase().includes(userSearch.toLowerCase()) || 
		                  (t.userEmail || "").toLowerCase().includes(userSearch.toLowerCase());
		const matchStatus = statusFilter === "all" || (t.status || "").toLowerCase() === statusFilter.toLowerCase();
		return matchProperty && matchUser && matchStatus;
	});

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-foreground">
					Tour Requests
				</h1>
				<p className="text-muted-foreground">
					Manage property tour requests from potential buyers
				</p>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filters
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-4">
						<Input
							placeholder="Search by property address..."
							value={propertySearch}
							onChange={(e) => setPropertySearch(e.target.value)}
							className="max-w-xs"
						/>
						<Input
							placeholder="Search by user name or email..."
							value={userSearch}
							onChange={(e) => setUserSearch(e.target.value)}
							className="max-w-xs"
						/>
						<Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="confirmed">Confirmed</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
								<SelectItem value="cancelled">Cancelled</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Tour Requests Table */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Tour Requests</CardTitle>
					<CardDescription>
						Latest property tour requests from potential buyers
					</CardDescription>
				</CardHeader>
				<CardContent>
					{loading ? (
						<p className="text-center text-muted-foreground py-8">Loading tour requests...</p>
					) : filteredTours.length === 0 ? (
						<p className="text-center text-muted-foreground py-8">No tour requests found.</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Request ID</TableHead>
									<TableHead>Property</TableHead>
									<TableHead>User Details</TableHead>
									<TableHead>Requested Date/Time</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Message</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredTours.map((request) => (
									<TableRow key={request.id}>
										<TableCell className="font-mono text-xs">
											{request.id}
										</TableCell>
										<TableCell>
											<div>
												<div className="font-medium">
													{request.propertyAddress}
												</div>
												<div className="text-xs text-muted-foreground font-mono">
													ID: {request.propertyId}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div>
												<div className="font-medium">
													{request.userName}
												</div>
												<div className="text-sm text-muted-foreground flex items-center gap-1">
													<Mail className="h-3 w-3" />
													{request.userEmail}
												</div>
												<div className="text-sm text-muted-foreground flex items-center gap-1">
													<Phone className="h-3 w-3" />
													{request.userPhone}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div>
												<div className="font-medium flex items-center gap-1">
													<Calendar className="h-3.5 w-3.5 text-muted-foreground" />
													{request.requestedDate}
												</div>
												<div className="text-sm text-muted-foreground pl-4.5">
													{request.requestedTime}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge className={getStatusColor(request.status)}>
												{request.status}
											</Badge>
										</TableCell>
										<TableCell className="max-w-xs">
											<div className="truncate" title={request.message}>
												{request.message}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
