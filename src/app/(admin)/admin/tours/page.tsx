"use client";
import React, { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
	Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function ToursPage() {
	const [tourRequests, setTourRequests] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [propertySearch, setPropertySearch] = useState("");
	const [userSearch, setUserSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	const fetchTours = async () => {
		try {
			const res = await fetch("/api/admin/tours");
			const json = await res.json();
			if (json.success) {
				setTourRequests(json.tours);
			}
		} catch (e) {
			console.error("Error fetching tours:", e);
			toast.error("Failed to load tour requests");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTours();
	}, []);

	// Handle Status Change
	const handleStatusChange = async (tourId: string, newStatus: string) => {
		try {
			const res = await fetch(`/api/admin/tours/${tourId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus }),
			});
			if (!res.ok) throw new Error("Failed to update status");

			setTourRequests((prev) =>
				prev.map((t) => (t.id === tourId ? { ...t, status: newStatus } : t))
			);
			toast.success(`Tour status updated to "${newStatus}"`);
		} catch (err: any) {
			toast.error(err.message || "Failed to update tour status");
		}
	};

	// Handle Delete Tour
	const handleDeleteTour = async (tourId: string) => {
		if (!confirm("Are you sure you want to delete this tour request?")) return;
		try {
			const res = await fetch(`/api/admin/tours/${tourId}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Failed to delete tour request");

			setTourRequests((prev) => prev.filter((t) => t.id !== tourId));
			toast.success("Tour request deleted successfully");
		} catch (err: any) {
			toast.error(err.message || "Failed to delete tour request");
		}
	};

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
									<TableHead className="text-right">Actions</TableHead>
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
													{request.userPhone || "N/A"}
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
											<Select
												value={request.status?.toLowerCase() || "pending"}
												onValueChange={(val) => {
													const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
													handleStatusChange(request.id, capitalized);
												}}
											>
												<SelectTrigger className="w-32 h-8 text-xs font-semibold">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="pending">Pending</SelectItem>
													<SelectItem value="confirmed">Confirmed</SelectItem>
													<SelectItem value="completed">Completed</SelectItem>
													<SelectItem value="cancelled">Cancelled</SelectItem>
												</SelectContent>
											</Select>
										</TableCell>
										<TableCell className="max-w-xs">
											<div className="truncate" title={request.message}>
												{request.message || "N/A"}
											</div>
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="icon"
												title="Delete Tour Request"
												onClick={() => handleDeleteTour(request.id)}
											>
												<Trash2 className="h-4 w-4 text-red-600" />
											</Button>
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

