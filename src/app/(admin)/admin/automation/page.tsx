"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Settings, Play, Pause, AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react"
import { toast } from "sonner"

// Initial automations dataset
const initialAutomations = [
  {
    id: "AUTO001",
    name: "MLS Data Sync",
    description: "Synchronizes property data from MLS feed",
    status: "running",
    lastRun: "2024-01-15 08:30:00",
    nextRun: "2024-01-15 12:30:00",
    frequency: "Every 4 hours",
    successRate: "98.5%",
    lastResult: "success",
    recordsProcessed: 1247,
  },
  {
    id: "AUTO002",
    name: "Price Drop Notifications",
    description: "Sends notifications when property prices drop",
    status: "running",
    lastRun: "2024-01-15 09:00:00",
    nextRun: "2024-01-16 09:00:00",
    frequency: "Daily",
    successRate: "99.2%",
    lastResult: "success",
    recordsProcessed: 89,
  },
  {
    id: "AUTO003",
    name: "New Listing Alerts",
    description: "Notifies users about new property listings",
    status: "paused",
    lastRun: "2024-01-14 18:00:00",
    nextRun: "Paused",
    frequency: "Every 2 hours",
    successRate: "97.8%",
    lastResult: "error",
    recordsProcessed: 0,
  },
  {
    id: "AUTO004",
    name: "User Engagement Tracking",
    description: "Tracks user property views and interactions",
    status: "running",
    lastRun: "2024-01-15 10:15:00",
    nextRun: "2024-01-15 11:15:00",
    frequency: "Hourly",
    successRate: "99.9%",
    lastResult: "success",
    recordsProcessed: 2156,
  },
  {
    id: "AUTO005",
    name: "Market Analysis Update",
    description: "Updates market trends and property valuations",
    status: "error",
    lastRun: "2024-01-15 06:00:00",
    nextRun: "Retry in 30 min",
    frequency: "Daily",
    successRate: "94.2%",
    lastResult: "error",
    recordsProcessed: 0,
  },
]

export default function AutomationPage() {
  const [automations, setAutomations] = useState(initialAutomations)
  const [runningSync, setRunningSync] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  // Toggle status handler
  const toggleStatus = (id: string) => {
    setAutomations((prev) =>
      prev.map((auto) => {
        if (auto.id === id) {
          const newStatus = auto.status === "running" ? "paused" : "running"
          toast.success(`${auto.name} ${newStatus === "running" ? "started" : "paused"} successfully!`)
          return {
            ...auto,
            status: newStatus,
            nextRun: newStatus === "paused" ? "Paused" : "Dynamic schedule active",
          }
        }
        return auto
      })
    )
  }

  // Trigger automation run simulator
  const runNow = (id: string, name: string) => {
    setRunningSync(id)
    toast.info(`Triggering ${name} immediately...`)
    
    setTimeout(() => {
      setAutomations((prev) =>
        prev.map((auto) => {
          if (auto.id === id) {
            const addedRecords = Math.floor(Math.random() * 80) + 12
            const nowStr = new Date().toLocaleString()
            return {
              ...auto,
              lastRun: nowStr,
              recordsProcessed: auto.recordsProcessed + addedRecords,
              lastResult: "success",
              status: "running"
            }
          }
          return auto
        })
      )
      setRunningSync(null)
      toast.success(`${name} completed successfully!`)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Automation Status</h1>
        <p className="text-muted-foreground">Monitor and manage automated processes</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Automations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automations.length}</div>
            <p className="text-xs text-muted-foreground">Active processes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automations.filter((a) => a.status === "running").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {automations.filter((a) => a.status === "error").length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97.9%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Automation Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Processes</CardTitle>
          <CardDescription>Current status and performance of all automated processes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Process</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Last Result</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {automations.map((automation) => (
                <TableRow key={automation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{automation.name}</div>
                      <div className="text-sm text-muted-foreground">{automation.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(automation.status)}>{automation.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{automation.lastRun}</TableCell>
                  <TableCell className="text-sm">{automation.nextRun}</TableCell>
                  <TableCell className="text-sm">{automation.frequency}</TableCell>
                  <TableCell className="text-sm font-medium">{automation.successRate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getResultIcon(automation.lastResult)}
                      <span className="text-sm">{automation.lastResult}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{automation.recordsProcessed.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {automation.status === "running" ? (
                        <Button 
                          onClick={() => toggleStatus(automation.id)} 
                          size="sm" 
                          variant="outline"
                        >
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => toggleStatus(automation.id)} 
                          size="sm" 
                          variant="outline"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      )}
                      <Button 
                        disabled={runningSync === automation.id}
                        onClick={() => runNow(automation.id, automation.name)} 
                        size="sm" 
                        variant="outline"
                      >
                        <RefreshCw className={`h-3 w-3 mr-1 ${runningSync === automation.id ? "animate-spin" : ""}`} />
                        {runningSync === automation.id ? "Running..." : "Run Now"}
                      </Button>
                    </div>
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
