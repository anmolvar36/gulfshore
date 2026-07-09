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
	Plus,
} from "lucide-react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [formData, setFormData] = useState({
		MLSNumber: "",
		FullAddress: "",
		City: "",
		ListPrice: "",
		PropertyType: "Single Family Residence",
		StandardStatus: "Active",
		BedroomsTotal: "",
		BathroomsFull: "",
		LivingArea: "",
		ImageUrl: "",
	});

	const [imageFile, setImageFile] = useState<File | null>(null);

	const handleCreateProperty = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.MLSNumber || !formData.FullAddress || !formData.City) {
			toast.error("MLS Number, Full Address, and City are required");
			return;
		}

		let finalImageUrl = formData.ImageUrl;

		try {
			if (imageFile) {
				const uploadData = new FormData();
				uploadData.append("file", imageFile);
				
				const uploadRes = await fetch("/api/upload", {
					method: "POST",
					body: uploadData,
				});

				if (!uploadRes.ok) {
					throw new Error("Failed to upload image");
				}

				const uploadJson = await uploadRes.json();
				finalImageUrl = uploadJson.url;
			}

			const payload = { ...formData, ImageUrl: finalImageUrl };

			const res = await fetch("/api/properties", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.error || "Failed to create property");
			}
			setIsCreateOpen(false);
			setFormData({
				MLSNumber: "",
				FullAddress: "",
				City: "",
				ListPrice: "",
				PropertyType: "Single Family Residence",
				StandardStatus: "Active",
				BedroomsTotal: "",
				BathroomsFull: "",
				LivingArea: "",
				ImageUrl: "",
			});
			setImageFile(null);
			toast.success("Property created successfully!");
			fetchProperties();
		} catch (err: any) {
			toast.error(err.message || "Something went wrong");
		}
	};

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
			<div className="flex items-center justify-between">
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
				<Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
					<Plus className="h-4 w-4" />
					Add Property
				</Button>
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
			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<DialogContent className="sm:max-w-[600px] w-[95vw] rounded-xl">
					<form onSubmit={handleCreateProperty}>
						<DialogHeader>
							<DialogTitle>Add New Property</DialogTitle>
							<DialogDescription>
								Fill in the property details below to add it to the active listings.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4 max-h-[65vh] overflow-y-auto px-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full">
							<div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
								<Label htmlFor="MLSNumber" className="text-left sm:text-right">
									MLS Number
								</Label>
								<Input
									id="MLSNumber"
									required
									value={formData.MLSNumber}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											MLSNumber: e.target.value,
										}))
									}
									className="sm:col-span-3"
								/>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
								<Label htmlFor="FullAddress" className="text-left sm:text-right">
									Full Address
								</Label>
								<Input
									id="FullAddress"
									required
									value={formData.FullAddress}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											FullAddress: e.target.value,
										}))
									}
									className="sm:col-span-3"
								/>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
								<Label htmlFor="City" className="text-left sm:text-right">
									City
								</Label>
								<Input
									id="City"
									required
									value={formData.City}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											City: e.target.value,
										}))
									}
									className="sm:col-span-3"
								/>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
								<Label htmlFor="ListPrice" className="text-left sm:text-right">
									List Price ($)
								</Label>
								<Input
									id="ListPrice"
									type="number"
									value={formData.ListPrice}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											ListPrice: e.target.value,
										}))
									}
									className="sm:col-span-3"
								/>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
								<Label htmlFor="PropertyType" className="text-left sm:text-right">
									Property Type
								</Label>
								<Select
									value={formData.PropertyType}
									onValueChange={(v) =>
										setFormData((prev) => ({ ...prev, PropertyType: v }))
									}
								>
									<SelectTrigger className="sm:col-span-3">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Single Family Residence">Single Family Residence</SelectItem>
										<SelectItem value="Condo">Condo</SelectItem>
										<SelectItem value="Townhouse">Townhouse</SelectItem>
										<SelectItem value="Land">Land</SelectItem>
										<SelectItem value="Commercial">Commercial</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
								<Label htmlFor="StandardStatus" className="text-left sm:text-right">
									Status
								</Label>
								<Select
									value={formData.StandardStatus}
									onValueChange={(v) =>
										setFormData((prev) => ({ ...prev, StandardStatus: v }))
									}
								>
									<SelectTrigger className="sm:col-span-3">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Active">Active</SelectItem>
										<SelectItem value="Pending">Pending</SelectItem>
										<SelectItem value="Sold">Sold</SelectItem>
										<SelectItem value="Closed">Closed</SelectItem>
										<SelectItem value="Off Market">Off Market</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
								<Label htmlFor="BedroomsTotal" className="text-left sm:text-right">
									Bedrooms
								</Label>
								<Input
									id="BedroomsTotal"
									type="number"
									value={formData.BedroomsTotal}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											BedroomsTotal: e.target.value,
										}))
									}
									className="sm:col-span-3"
								/>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
								<Label htmlFor="BathroomsFull" className="text-left sm:text-right">
									Bathrooms
								</Label>
								<Input
									id="BathroomsFull"
									type="number"
									value={formData.BathroomsFull}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											BathroomsFull: e.target.value,
										}))
									}
									className="sm:col-span-3"
								/>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
								<Label htmlFor="LivingArea" className="text-left sm:text-right">
									Living Area (Sqft)
								</Label>
								<Input
									id="LivingArea"
									type="number"
									value={formData.LivingArea}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											LivingArea: e.target.value,
										}))
									}
									className="sm:col-span-3"
								/>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
								<Label htmlFor="imageFile" className="text-left sm:text-right">
									Upload Photo
								</Label>
								<Input
									id="imageFile"
									type="file"
									accept="image/*"
									onChange={(e) => {
										if (e.target.files && e.target.files[0]) {
											setImageFile(e.target.files[0]);
											setFormData((prev) => ({ ...prev, ImageUrl: "" }));
										} else {
											setImageFile(null);
										}
									}}
									className="sm:col-span-3 cursor-pointer"
								/>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
								<Label htmlFor="ImageUrl" className="text-left sm:text-right text-muted-foreground text-xs">
									OR Paste URL
								</Label>
								<Input
									id="ImageUrl"
									type="url"
									placeholder="https://example.com/photo.jpg"
									value={formData.ImageUrl}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											ImageUrl: e.target.value,
										}))
									}
									className="sm:col-span-3"
									disabled={!!imageFile}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button type="submit">Create Property</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
