"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Shield, Palette, Globe, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
	const [notifications, setNotifications] = useState(true);
	const [emailAlerts, setEmailAlerts] = useState(true);
	const [darkMode, setDarkMode] = useState(false);

	return (
		<div className="space-y-6 px-4 my-5">
			<div className="flex items-center gap-3">
				<Settings className="h-8 w-8 text-primary" />
				<div>
					<h1 className="text-3xl font-bold">Settings</h1>
					<p className="text-muted-foreground">Manage your admin panel preferences</p>
				</div>
			</div>

			<div className="grid gap-6">
				{/* Profile Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Globe className="h-5 w-5" />
							General Settings
						</CardTitle>
						<CardDescription>Configure your basic preferences</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="siteName">Site Name</Label>
								<Input id="siteName" defaultValue="Gulfshore Group" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="contactEmail">Contact Email</Label>
								<Input id="contactEmail" type="email" defaultValue="admin@gulfshore.com" />
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="siteUrl">Site URL</Label>
							<Input id="siteUrl" defaultValue="https://gulfshore.com" />
						</div>
						<Button onClick={() => toast.success("Settings saved!")} className="bg-primary text-white">
							<Save className="h-4 w-4 mr-2" />
							Save Changes
						</Button>
					</CardContent>
				</Card>

				{/* Notification Settings */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Bell className="h-5 w-5" />
							Notifications
						</CardTitle>
						<CardDescription>Control how you receive notifications</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">Push Notifications</p>
								<p className="text-sm text-muted-foreground">Receive in-app notifications</p>
							</div>
							<Switch checked={notifications} onCheckedChange={setNotifications} />
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">Email Alerts</p>
								<p className="text-sm text-muted-foreground">Get email for new leads and contacts</p>
							</div>
							<Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
						</div>
					</CardContent>
				</Card>

				{/* Appearance */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Palette className="h-5 w-5" />
							Appearance
						</CardTitle>
						<CardDescription>Customize the look and feel</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">Dark Mode</p>
								<p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
							</div>
							<Switch checked={darkMode} onCheckedChange={setDarkMode} />
						</div>
					</CardContent>
				</Card>

				{/* Security */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							Security
						</CardTitle>
						<CardDescription>Manage your account security</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label>Current Password</Label>
							<Input type="password" placeholder="Enter current password" />
						</div>
						<div className="space-y-2">
							<Label>New Password</Label>
							<Input type="password" placeholder="Enter new password" />
						</div>
						<Button variant="outline" onClick={() => toast.success("Password updated!")}>
							Update Password
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
