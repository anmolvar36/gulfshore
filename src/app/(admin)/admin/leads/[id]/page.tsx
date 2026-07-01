"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ArrowLeft,
	Mail,
	Phone,
	Calendar,
	MapPin,
	Plus,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import CityList from "@/data/cities";
import PropertyCriteria from "./criteriaCard";
import axios from "axios";

// -------------------- OPTIONS --------------------
const statusOptions = [
	{ value: "New", label: "New" },
	{ value: "Contacted", label: "Contacted" },
	{ value: "Interested", label: "Interested" },
	{ value: "Closed", label: "Closed" },
	{ value: "Trash", label: "Trash" },
];

const tagOptions = [
	"Buyer",
	"Seller",
	"Hot Lead",
	"Cold Lead",
	"Investor",
];

// -------------------- COMPONENT --------------------
export default function LeadProfilePage() {
	const { id } = useParams();
	const [lead, setLead] = useState<any | null>(null);
	const [loading, setLoading] = useState(true);
	const [noteLoading, setNoteLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [newNote, setNewNote] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	// -------------------- FETCH LEAD --------------------
	useEffect(() => {
		if (!id) return;
		const fetchLead = async () => {
			try {
				const res = await fetch(`/api/leads/${id}`);
				if (!res.ok) throw new Error("Failed to fetch lead");
				const data = await res.json();
				setLead(data);
				setSelectedStatus(data.status || "");
				setSelectedTags(data.tags || []);
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};
		fetchLead();
	}, [id]);

	// -------------------- HANDLE ADD NOTE --------------------
	const handleAddNote = async () => {
		if (!newNote.trim()) return alert("Note cannot be empty");
		try {
			setNoteLoading(true);
			const res = await fetch(`/api/leads/${id}/notes`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: newNote }),
			});
			if (!res.ok) throw new Error("Failed to add note");
			const updated = await res.json();
			setLead(updated);
			setNewNote("");
			setNoteLoading(false);
			toast.success("Note Added!");
		} catch (err: any) {
			toast.error(err.message);
			setNoteLoading(false);
		}
	};

	// -------------------- HANDLE DELETE NOTE --------------------
	const handleDeleteNote = async (noteId: string) => {
		try {
			const res = await fetch(`/api/leads/${id}/notes/${noteId}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Failed to delete note");
			const updated = await res.json();
			setLead(updated);
			toast.success("Note Removed!");
		} catch (err: any) {
			toast.error(err.message);
		}
	};

	// -------------------- HANDLE TAG TOGGLE --------------------
	const handleTagToggle = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag)
				? prev.filter((t) => t !== tag)
				: [...prev, tag]
		);
	};

	// -------------------- HANDLE SAVE STATUS & TAGS --------------------
	const handleSaveChanges = async () => {
		try {
			const res = await fetch(`/api/leads/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					status: selectedStatus,
					tags: selectedTags,
				}),
			});
			if (!res.ok) throw new Error("Failed to update lead");
			const updated = await res.json();
			setLead(updated);
			toast.success("Lead updated successfully!");
		} catch (err: any) {
			toast.error(err.message);
		}
	};
	const refreshLead = async () => {
		try {
			const res = await axios.get(`/api/leads/${id}`);
			setLead(res.data);
		} catch (err) {
			console.error("Failed to refresh lead:", err);
		}
	};

	// -------------------- HANDLE ADD CRITERIA --------------------
	const handleAddCriteria = async (
		e: React.FormEvent<HTMLFormElement>
	) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const criteria = Object.fromEntries(formData.entries());
		try {
			const res = await fetch(`/api/leads/${id}/criteria`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(criteria),
			});
			if (!res.ok) throw new Error("Failed to add property criteria");
			const updated = await res.json();
			setLead(updated);
			e.currentTarget.reset();
		} catch (err: any) {
			toast.error(err.message);
		}
	};
	const handleDeleteCriteria = async (criteriaId: string) => {
		try {
			const res = await fetch(
				`/api/leads/${id}/criteria/${criteriaId}`,
				{
					method: "DELETE",
				}
			);
			if (!res.ok) throw new Error("Failed to delete criteria");
			const updated = await res.json();
			setLead(updated);
			toast.success("Criteria Removed!");
		} catch (err: any) {
			toast.error(err.message);
		}
	};

	if (loading)
		return (
			<div className="p-6 text-center text-muted-foreground">
				Loading lead details...
			</div>
		);
	if (error)
		return (
			<div className="p-6 text-center text-red-500">
				Error: {error}
			</div>
		);
	if (!lead)
		return (
			<div className="p-6 text-center text-muted-foreground">
				No details available.
			</div>
		);

	// -------------------- UI --------------------
	return (
		<div className="space-y-6">
			{/* HEADER */}
			<div className="flex items-center justify-between gap-4">
				<Link href="/admin/leads">
					<Button
						variant="outline"
						size="sm"
						className="flex items-center gap-2">
						<ArrowLeft className="h-4 w-4" /> Back
					</Button>
				</Link>
				<div>
					<h1 className="text-lg font-bold">
						{lead.firstName} {lead.lastName}
					</h1>
					<p className="text-muted-foreground">Lead Profile</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* LEFT SIDE */}
				<div className="lg:col-span-2 space-y-6">
					{/* Lead Info */}
					<Card>
						<CardHeader>
							<CardTitle>Lead Information</CardTitle>
							<CardDescription>
								Contact details & inquiry info
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{[
									{ label: "Email", value: lead.email, icon: Mail },
									{ label: "Phone", value: lead.phone, icon: Phone },
									{ label: "Source", value: lead.source },
									{
										label: "Created",
										value: new Date(lead.createdAt).toLocaleString(),
										icon: Calendar,
									},
								].map((f) => (
									<div key={f.label}>
										<Label className="text-xs text-muted-foreground">
											{f.label}
										</Label>
										<div className="flex items-center gap-2 mt-1">
											{f.icon && (
												<f.icon className="h-4 w-4 text-muted-foreground" />
											)}
											<span>{f.value || "—"}</span>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<PropertyCriteria lead={lead} refreshLead={refreshLead} />

					<Card>
						<CardHeader>
							<CardTitle>Inquiry History</CardTitle>
							<CardDescription>
								All property inquiries from this lead
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{lead.inquiryHistory?.length ? (
									lead.inquiryHistory.map((inquiry: any) => (
										<div
											key={inquiry._id}
											className="p-3 border border-border rounded-lg">
											<div className="flex items-start justify-between">
												<div>
													<p className="font-medium text-foreground">
														{inquiry.propertyAddress}
													</p>
													<p className="text-sm text-muted-foreground mt-1">
														{inquiry.inquiryType}
													</p>
												</div>
												<span className="text-xs text-muted-foreground">
													{inquiry.createdAt.toLocaleString()}
												</span>
											</div>
										</div>
									))
								) : (
									<p className="text-sm text-muted-foreground">
										No inquiries yet.
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* RIGHT SIDE */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Status & Tags</CardTitle>
							<CardDescription>
								Manage status and categorization
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Status */}
							<div>
								<Label>Status</Label>
								<Select
									value={selectedStatus}
									onValueChange={setSelectedStatus}>
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										{statusOptions.map((s) => (
											<SelectItem key={s.value} value={s.value}>
												{s.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Tags */}
							<div className="space-y-2">
								<Label>Tags</Label>
								<div className="space-y-1">
									{tagOptions.map((tag) => (
										<div
											key={tag}
											className="flex items-center gap-2">
											<input
												type="checkbox"
												checked={selectedTags.includes(tag)}
												onChange={() => handleTagToggle(tag)}
											/>
											<Label className="cursor-pointer">{tag}</Label>
										</div>
									))}
								</div>
							</div>

							<Button className="w-full" onClick={handleSaveChanges}>
								Save Changes
							</Button>
						</CardContent>
					</Card>
					{/* Notes */}
					<Card>
						<CardHeader>
							<CardTitle>Notes</CardTitle>
							<CardDescription>
								Add and manage lead notes
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Textarea
									placeholder="Add a note..."
									value={newNote}
									onChange={(e) => setNewNote(e.target.value)}
									className="min-h-[80px]"
								/>
								<Button
									onClick={handleAddNote}
									disabled={noteLoading}
									className="w-full flex items-center gap-2">
									<Plus className="h-4 w-4" /> Add Note
								</Button>
							</div>

							<div className="space-y-3 pt-4 border-t border-border">
								{lead.notes?.length ? (
									lead.notes.map((note: any) => (
										<div
											key={note._id}
											className="p-3 bg-muted/50 rounded-lg">
											<div className="flex items-start justify-between">
												<div>
													<p>{note.content}</p>
													<p className="text-xs text-muted-foreground mt-2">
														{new Date(
															note.createdAt
														).toLocaleString()}
													</p>
												</div>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDeleteNote(note._id)}
													className="text-destructive hover:text-destructive">
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									))
								) : (
									<p className="text-sm text-muted-foreground">
										No notes yet.
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
