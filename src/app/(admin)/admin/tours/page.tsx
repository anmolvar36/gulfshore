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
import { Badge } from "@/components/ui/badge";
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
	Building2,
	Clock,
	CheckCircle2,
	XCircle,
	AlertCircle,
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

	const getStatusStyles = (status: string) => {
		switch (status?.toLowerCase()) {
			case "confirmed":
				return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
			case "completed":
				return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
			case "cancelled":
				return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
			case "pending":
			default:
				return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
		}
	};

	const pendingCount = tourRequests.filter((t) => (t.status || "").toLowerCase() === "pending").length;
	const confirmedCount = tourRequests.filter((t) => (t.status || "").toLowerCase() === "confirmed").length;
	const completedCount = tourRequests.filter((t) => (t.status || "").toLowerCase() === "completed").length;

	return (
		<div className="space-y-6 px-2 md:px-4 my-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Tour Requests</h1>
					<p className="text-muted-foreground mt-1 text-sm md:text-base">
						Manage, schedule, and track property tour requests from potential buyers
					</p>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="pt-6 text-center">
						<div className="text-3xl font-bold text-foreground">{tourRequests.length}</div>
						<p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
							<Clock className="h-4 w-4 text-blue-500" /> Total Tours
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6 text-center">
						<div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
						<p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
							<AlertCircle className="h-4 w-4 text-amber-500" /> Pending
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6 text-center">
						<div className="text-3xl font-bold text-blue-600">{confirmedCount}</div>
						<p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
							<CheckCircle2 className="h-4 w-4 text-blue-500" /> Confirmed
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6 text-center">
						<div className="text-3xl font-bold text-emerald-600">{completedCount}</div>
						<p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
							<CheckCircle2 className="h-4 w-4 text-emerald-500" /> Completed
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-base font-semibold">
						<Filter className="h-4 w-4" />
						Filter Requests
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-4 items-center">
						<Input
							placeholder="Search by property address..."
							value={propertySearch}
							onChange={(e) => setPropertySearch(e.target.value)}
							className="w-full md:max-w-xs"
						/>
						<Input
							placeholder="Search by user name or email..."
							value={userSearch}
							onChange={(e) => setUserSearch(e.target.value)}
							className="w-full md:max-w-xs"
						/>
						<Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
							<SelectTrigger className="w-full md:w-44">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Statuses</SelectItem>
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
						All scheduled property visits submitted by website visitors
					</CardDescription>
				</CardHeader>
				<CardContent>
					{loading ? (
						<p className="text-center text-muted-foreground py-8">Loading tour requests...</p>
					) : filteredTours.length === 0 ? (
						<p className="text-center text-muted-foreground py-8">No tour requests found.</p>
					) : (
						<div className="overflow-x-auto rounded-md border">
							<Table>
								<TableHeader className="bg-muted/50">
									<TableRow>
										<TableHead className="w-[120px]">Request ID</TableHead>
										<TableHead className="min-w-[200px]">Property</TableHead>
										<TableHead className="min-w-[180px]">User Details</TableHead>
										<TableHead className="min-w-[150px]">Requested Date/Time</TableHead>
										<TableHead className="w-[150px] text-center">Status Action</TableHead>
										<TableHead className="min-w-[180px]">Message</TableHead>
										<TableHead className="w-[80px] text-right">Action</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredTours.map((request) => {
										const displayAddr = request.propertyAddress === "MLS: " || !request.propertyAddress || request.propertyAddress === "N/A"
											? "General / Direct Tour"
											: request.propertyAddress;

										return (
											<TableRow key={request.id} className="align-middle">
												<TableCell className="font-mono text-xs text-muted-foreground">
													<span title={request.id}>
														#{request.id.slice(-8)}
													</span>
												</TableCell>
												<TableCell>
													<div className="flex items-start gap-2">
														<Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
														<div>
															<div className="font-medium text-sm">
																{displayAddr}
															</div>
															{request.propertyId && (
																<div className="text-xs text-muted-foreground font-mono">
																	MLS ID: {request.propertyId}
																</div>
															)}
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div>
														<div className="font-semibold text-sm">
															{request.userName}
														</div>
														<div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
															<Mail className="h-3 w-3" />
															{request.userEmail}
														</div>
														{request.userPhone && (
															<div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
																<Phone className="h-3 w-3" />
																{request.userPhone}
															</div>
														)}
													</div>
												</TableCell>
												<TableCell>
													<div>
														<div className="font-medium text-sm flex items-center gap-1">
															<Calendar className="h-3.5 w-3.5 text-muted-foreground" />
															{request.requestedDate}
														</div>
														<div className="text-xs text-muted-foreground pl-4.5 mt-0.5">
															⏰ {request.requestedTime}
														</div>
													</div>
												</TableCell>
												<TableCell className="text-center">
													<Select
														value={request.status?.toLowerCase() || "pending"}
														onValueChange={(val) => {
															const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
															handleStatusChange(request.id, capitalized);
														}}
													>
														<SelectTrigger
															className={`w-32 h-8 text-xs font-semibold mx-auto rounded-full border transition-all ${getStatusStyles(
																request.status
															)}`}
														>
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
													<div className="text-xs text-muted-foreground truncate" title={request.message}>
														{request.message || "No additional message."}
													</div>
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
														title="Delete Tour Request"
														onClick={() => handleDeleteTour(request.id)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
