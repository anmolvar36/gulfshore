"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HelpCircle, BookOpen, MessageCircle, Phone, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const faqs = [
	{
		q: "How do I add a new property listing?",
		a: "Go to Properties List from the sidebar and use the MLS sync automation to import new listings automatically.",
	},
	{
		q: "How do I manage leads?",
		a: "Navigate to Leads from the sidebar. You can view, filter, add notes, and update statuses of all leads.",
	},
	{
		q: "How does the MLS Data Sync work?",
		a: "The MLS sync runs every 4 hours automatically and pulls new property listings from your configured MLS feed into the database.",
	},
	{
		q: "How to edit city or community information?",
		a: "Go to Properties → Cities or Communities. Click the edit icon on any entry to update images, descriptions, and featured status.",
	},
	{
		q: "How do I create a blog post?",
		a: "Navigate to Blogs from the sidebar and click 'Create Blog' to write and publish new articles.",
	},
	{
		q: "How to view scheduled tours?",
		a: "Go to Users → Tours to see all scheduled property visits with contact information and status.",
	},
];

export default function HelpPage() {
	const [openFaq, setOpenFaq] = useState<number | null>(null);
	const [search, setSearch] = useState("");

	const filtered = faqs.filter(
		(f) =>
			f.q.toLowerCase().includes(search.toLowerCase()) ||
			f.a.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div className="space-y-6 px-4 my-5">
			<div className="flex items-center gap-3">
				<HelpCircle className="h-8 w-8 text-primary" />
				<div>
					<h1 className="text-3xl font-bold">Help & Support</h1>
					<p className="text-muted-foreground">Find answers and get assistance</p>
				</div>
			</div>

			{/* Search */}
			<div className="relative max-w-xl">
				<Input
					placeholder="Search help articles..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="pl-4 h-12 text-base"
				/>
			</div>

			{/* Quick Links */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="hover:shadow-md transition-shadow cursor-pointer">
					<CardHeader className="flex flex-row items-center gap-3">
						<BookOpen className="h-6 w-6 text-primary" />
						<CardTitle className="text-base">Documentation</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						Read the full admin panel documentation and user guides.
					</CardContent>
				</Card>
				<Card className="hover:shadow-md transition-shadow cursor-pointer">
					<CardHeader className="flex flex-row items-center gap-3">
						<MessageCircle className="h-6 w-6 text-primary" />
						<CardTitle className="text-base">Live Chat</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						Chat with our support team during business hours (9 AM – 6 PM EST).
					</CardContent>
				</Card>
				<Card className="hover:shadow-md transition-shadow cursor-pointer">
					<CardHeader className="flex flex-row items-center gap-3">
						<Phone className="h-6 w-6 text-primary" />
						<CardTitle className="text-base">Contact Support</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground flex items-center gap-1">
						<Mail className="h-3 w-3" />
						support@gulfshore.com
					</CardContent>
				</Card>
			</div>

			{/* FAQs */}
			<Card>
				<CardHeader>
					<CardTitle>Frequently Asked Questions</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					{filtered.length === 0 ? (
						<p className="text-muted-foreground text-sm">No results found for "{search}"</p>
					) : (
						filtered.map((faq, i) => (
							<div key={i} className="border rounded-lg overflow-hidden">
								<button
									onClick={() => setOpenFaq(openFaq === i ? null : i)}
									className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors">
									<span className="font-medium text-sm">{faq.q}</span>
									{openFaq === i ? (
										<ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
									) : (
										<ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
									)}
								</button>
								{openFaq === i && (
									<div className="px-4 py-3 bg-muted/30 border-t text-sm text-muted-foreground">
										{faq.a}
									</div>
								)}
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}
