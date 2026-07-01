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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Home,
	Eye,
	Heart,
	Search,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";

const getStatusColor = (status: string) => {
	switch (status?.toLowerCase()) {
		case "active":
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case "pending":
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
		case "sold":
			return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
		case "off-market":
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
	}
};

export default function PropertiesPage() {
	const [properties, setProperties] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [searchTerm, setSearchTerm] = useState("");
	const [citySearch, setCitySearch] = useState("");
	const [developmentSearch, setDevelopmentSearch] = useState("");
	const [mlsSearch, setMlsSearch] = useState("");
	const limit = 20;

	const fetchProperties = async () => {
		setLoading(true);
		try {
			let url = `/api/properties?page=${page}&limit=${limit}&Status=Active`;
			if (citySearch) {
				url += `&city=${encodeURIComponent(citySearch)}`;
			}
			if (developmentSearch) {
				url += `&development=${encodeURIComponent(developmentSearch)}`;
			}
			if (mlsSearch) {
				url += `&MLSNumber=${encodeURIComponent(mlsSearch)}`;
			}

			const res = await fetch(url);
			const json = await res.json();
			if (json.success) {
				setProperties(json.data || []);
				setTotalCount(json.total || 0);
				setTotalPages(json.totalPages || 1);
			}
		} catch (error) {
			console.error("Error fetching properties:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProperties();
	}, [page]);

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setPage(1);
		fetchProperties();
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-foreground">
					Properties Listings
					<span className="text-muted-foreground text-sm font-normal ml-2">
						({totalCount.toLocaleString()} total active)
					</span>
				</h1>
				<p className="text-muted-foreground">
					Manage and monitor all active property listings across Florida
				</p>
			</div>

			{/* Search Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base font-semibold">Search Filter</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4 items-end">
						<div className="flex-1 min-w-[200px]">
							<label className="text-xs font-semibold text-muted-foreground mb-1 block">City</label>
							<Input
								placeholder="e.g. Naples"
								value={citySearch}
								onChange={(e) => setCitySearch(e.target.value)}
							/>
						</div>
						<div className="flex-1 min-w-[200px]">
							<label className="text-xs font-semibold text-muted-foreground mb-1 block">Development / Community</label>
							<Input
								placeholder="e.g. Lely Resort"
								value={developmentSearch}
								onChange={(e) => setDevelopmentSearch(e.target.value)}
							/>
						</div>
						<div className="flex-1 min-w-[150px]">
							<label className="text-xs font-semibold text-muted-foreground mb-1 block">MLS Number</label>
							<Input
								placeholder="e.g. 222014022"
								value={mlsSearch}
								onChange={(e) => setMlsSearch(e.target.value)}
							/>
						</div>
						<Button type="submit" className="bg-[#B89A6A] hover:bg-[#a6895b] text-white">
							<Search className="h-4 w-4 mr-2" />
							Search
						</Button>
						<Button 
							type="button" 
							variant="outline" 
							onClick={() => {
								setCitySearch("");
								setDevelopmentSearch("");
								setMlsSearch("");
								setPage(1);
								setTimeout(fetchProperties, 0);
							}}
						>
							Reset
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* Properties Table */}
			<Card>
				<CardHeader>
					<CardTitle>Property Listings</CardTitle>
					<CardDescription>
						Detailed view of all active property listings from database
					</CardDescription>
				</CardHeader>
				<CardContent>
					{loading ? (
						<p className="text-center text-muted-foreground py-8">Loading properties...</p>
					) : properties.length === 0 ? (
						<p className="text-center text-muted-foreground py-8">No properties found matching criteria.</p>
					) : (
						<>
							<div className="rounded-md border overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Property Details</TableHead>
											<TableHead>Price</TableHead>
											<TableHead>Type</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>City</TableHead>
											<TableHead>MLS Number</TableHead>
											<TableHead>Photos</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{properties.map((property) => (
											<TableRow key={property._id}>
												<TableCell>
													<div>
														<div className="font-medium">
															{property.PropertyAddress}
														</div>
														<div className="text-xs text-muted-foreground mt-0.5">
															{property.BedsTotal} bd • {property.BathsTotal} ba
															{property.ApproxLivingArea && ` • ${Number(property.ApproxLivingArea).toLocaleString()} sqft`}
														</div>
													</div>
												</TableCell>
												<TableCell className="font-medium">
													${property.CurrentPrice?.toLocaleString()}
												</TableCell>
												<TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
													{property.PropertyClass}
												</TableCell>
												<TableCell>
													<Badge className={getStatusColor(property.Status)}>
														{property.Status}
													</Badge>
												</TableCell>
												<TableCell className="text-xs font-semibold text-muted-foreground">
													{property.City}
												</TableCell>
												<TableCell className="font-mono text-xs">
													{property.MLSNumber}
												</TableCell>
												<TableCell className="text-xs text-muted-foreground">
													{property.AllPixList?.length || 0} photos
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{/* Pagination Controls */}
							<div className="flex items-center justify-between mt-4">
								<span className="text-xs text-muted-foreground">
									Page {page} of {totalPages} (Showing {(properties.length).toLocaleString()} rows)
								</span>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage((p) => Math.max(p - 1, 1))}
										disabled={page === 1}
									>
										<ChevronLeft className="h-4 w-4 mr-1" />
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
										disabled={page === totalPages}
									>
										Next
										<ChevronRight className="h-4 w-4 ml-1" />
									</Button>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
