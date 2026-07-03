"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, TrendingDown, MousePointer, Users, Mail, MessageSquare, Phone, Facebook, Instagram, Linkedin, Share2 } from "lucide-react"
import { useState, Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"

// Mock performance data
const performanceData = [
  {
    id: 1,
    title: "Weekly Product Updates",
    type: "New Updates",
    channel: "Email",
    sentAt: "2024-01-15 10:00 AM",
    totalReceivers: 1250,
    clicks: 342,
    clickRate: 27.4,
    openRate: 68.2,
    deliveryRate: 98.5,
  },
  {
    id: 2,
    title: "Welcome to Our Platform",
    type: "Welcome",
    channel: "WhatsApp",
    sentAt: "2024-01-16 09:00 AM",
    totalReceivers: 45,
    clicks: 38,
    clickRate: 84.4,
    openRate: 95.6,
    deliveryRate: 100,
  },
  {
    id: 3,
    title: "Flash Sale Alert",
    type: "Price Drop",
    channel: "Text",
    sentAt: "2024-01-17 02:00 PM",
    totalReceivers: 890,
    clicks: 156,
    clickRate: 17.5,
    openRate: 89.2,
    deliveryRate: 97.8,
  },
  {
    id: 4,
    title: "Monthly Report Due",
    type: "Reminders",
    channel: "Email",
    sentAt: "2024-01-18 08:00 AM",
    totalReceivers: 12,
    clicks: 11,
    clickRate: 91.7,
    openRate: 100,
    deliveryRate: 100,
  },
]

// Mock social media performance data
const socialPerformanceData = [
  {
    id: 1,
    title: "Beautiful New Naples Listing",
    type: "New Listings",
    channel: "Facebook",
    sentAt: "2024-01-15 10:00 AM",
    totalReceivers: 4500, // Reach
    clicks: 684,
    clickRate: 15.2,
    openRate: 45.3, // Engagement Rate
    deliveryRate: 100,
  },
  {
    id: 2,
    title: "Price Drop Alert on Waterfront Villa",
    type: "Price Drop",
    channel: "Instagram",
    sentAt: "2024-01-16 09:00 AM",
    totalReceivers: 8200,
    clicks: 1240,
    clickRate: 15.1,
    openRate: 68.4,
    deliveryRate: 100,
  },
  {
    id: 3,
    title: "Market Report: SW Florida Real Estate",
    type: "Market Trends",
    channel: "LinkedIn",
    sentAt: "2024-01-17 02:00 PM",
    totalReceivers: 1200,
    clicks: 180,
    clickRate: 15.0,
    openRate: 35.5,
    deliveryRate: 100,
  },
]

const chartData = [
  { name: "Mon", clicks: 120, opens: 340 },
  { name: "Tue", clicks: 98, opens: 280 },
  { name: "Wed", clicks: 156, opens: 420 },
  { name: "Thu", clicks: 89, opens: 250 },
  { name: "Fri", clicks: 203, opens: 480 },
  { name: "Sat", clicks: 145, opens: 380 },
  { name: "Sun", clicks: 167, opens: 390 },
]

const channelData = [
  { name: "Email", value: 65, color: "#3b82f6" },
  { name: "WhatsApp", value: 25, color: "#10b981" },
  { name: "Text", value: 10, color: "#f59e0b" },
]

const socialChannelData = [
  { name: "Facebook", value: 55, color: "#1877f2" },
  { name: "Instagram", value: 30, color: "#e1306c" },
  { name: "LinkedIn", value: 15, color: "#0077b5" },
]

const typeData = [
  { name: "New Updates", value: 35, color: "#8b5cf6" },
  { name: "Welcome", value: 20, color: "#10b981" },
  { name: "Price Drop", value: 25, color: "#ef4444" },
  { name: "Reminders", value: 15, color: "#f59e0b" },
  { name: "New User", value: 5, color: "#3b82f6" },
]

function PerformanceContent() {
  const [timeFilter, setTimeFilter] = useState("7d")
  const [channelFilter, setChannelFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<any>(null)

  const searchParams = useSearchParams()
  const tab = searchParams.get("tab")
  const isSocial = tab === "social"

  useEffect(() => {
    setLoading(true)
    fetch("/api/admin/performance")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMetrics(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "Email":
        return <Mail className="h-4 w-4 text-blue-500" />
      case "WhatsApp":
        return <Phone className="h-4 w-4 text-green-500" />
      case "Text":
        return <MessageSquare className="h-4 w-4 text-amber-500" />
      case "Facebook":
        return <Facebook className="h-4 w-4 text-blue-600" />
      case "Instagram":
        return <Instagram className="h-4 w-4 text-pink-600" />
      case "LinkedIn":
        return <Linkedin className="h-4 w-4 text-blue-700" />
      default:
        return <Share2 className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "New Updates":
      case "New Listings":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "Welcome":
      case "Market Trends":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Price Drop":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Reminders":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "New User":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full animate-pulse p-6">
        <div className="h-10 w-1/3 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-72 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-72 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    )
  }

  // Extract metrics based on selected tab
  const data = isSocial ? metrics?.social : metrics?.notifications

  const totalClicks = data?.totalClicks || 0
  const totalReceivers = isSocial ? (data?.reach || 0) : (data?.totalReceivers || 0)
  const avgClickRate = Number(data?.clickRate || 0)
  const avgOpenRate = isSocial ? Number(data?.avgEngagement?.replace('%', '') || 0) : Number(data?.openRate || 0)
  const activeChannelData = data?.channelData || []
  const chartData = data?.chartData || []
  const activeData = data?.list || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isSocial ? "Social Media Campaign Performance" : "Notification Performance"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isSocial 
              ? "Track post reach, clicks, and engagement metrics across networks" 
              : "Track clicks, engagement, and delivery metrics"}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              {isSocial ? (
                <>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalClicks.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12.5%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              {isSocial ? "Total Reach" : "Total Receivers"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalReceivers.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +8.2%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgClickRate.toFixed(1)}%</div>
            <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
              <TrendingDown className="h-3 w-3" />
              -2.1%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isSocial ? "Avg Engagement" : "Avg Open Rate"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgOpenRate.toFixed(1)}%</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              +5.3%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <CardDescription>
              {isSocial ? "Post clicks and engagement over the last 7 days" : "Clicks and opens over the last 7 days"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clicks" fill="#3b82f6" name="Clicks" />
                <Bar dataKey="opens" fill="#10b981" name={isSocial ? "Engagement" : "Opens"} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Distribution</CardTitle>
            <CardDescription>
              {isSocial ? "Distribution of clicks by social network" : "Notification distribution by channel"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activeChannelData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {activeChannelData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance</CardTitle>
          <CardDescription>
            {isSocial ? "Individual social media post clicks logged" : "Individual notification performance metrics"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>{isSocial ? "Last Clicked" : "Sent At"}</TableHead>
                <TableHead className="text-right">{isSocial ? "Estimated Reach" : "Receivers"}</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Click Rate</TableHead>
                <TableHead className="text-right">{isSocial ? "Engagement" : "Open Rate"}</TableHead>
                <TableHead className="text-right">{isSocial ? "Status" : "Delivery"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeData.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getChannelIcon(item.channel)}
                      {item.channel}
                    </div>
                  </TableCell>
                  <TableCell>{item.sentAt}</TableCell>
                  <TableCell className="text-right">{item.totalReceivers.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.clicks.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        item.clickRate > 30
                          ? "text-green-600"
                          : item.clickRate > 15
                            ? "text-yellow-600"
                            : "text-red-600"
                      }
                    >
                      {item.clickRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        item.openRate > 80 ? "text-green-600" : item.openRate > 60 ? "text-yellow-600" : "text-red-600"
                      }
                    >
                      {item.openRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={item.deliveryRate > 95 ? "text-green-600" : "text-yellow-600"}>
                      {isSocial ? "Active" : `${item.deliveryRate}%`}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PerformancePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground font-medium animate-pulse">Loading performance metrics...</div>}>
      <PerformanceContent />
    </Suspense>
  )
}
