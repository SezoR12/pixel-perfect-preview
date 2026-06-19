import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Notification, getNotifications, markNotificationRead, markAllNotificationsRead, triggerMockNotification } from "@/lib/api";
import { Bell, CheckCircle2, AlertCircle, Send, Radio, Mail, Smartphone, RefreshCw, Trash2 } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Mock form
  const [mockTitle, setMockTitle] = useState("");
  const [mockMessage, setMockMessage] = useState("");
  const [mockType, setMockType] = useState("push");
  const [mockPriority, setMockPriority] = useState("high");
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: number) {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setSuccess("All alerts marked as settled.");
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDispatch(e: React.FormEvent) {
    e.preventDefault();
    setDispatching(true);
    setError("");
    setSuccess("");
    try {
      const created = await triggerMockNotification(mockTitle, mockMessage, mockType, mockPriority);
      setNotifications([created, ...notifications]);
      setSuccess(`Dispatched successfully via ${mockType.toUpperCase()} gateway.`);
      setMockTitle("");
      setMockMessage("");
    } catch (err: any) {
      setError(err.message || "Dispatch operation failed");
    } finally {
      setDispatching(false);
    }
  }

  const typeIcons: Record<string, React.ReactNode> = {
    in_app: <Bell className="h-5 w-5 text-primary" />,
    email: <Mail className="h-5 w-5 text-blue-600" />,
    push: <Radio className="h-5 w-5 text-green-600" />,
    sms: <Smartphone className="h-5 w-5 text-amber-600" />,
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeRoute="notifications" />

      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary flex-shrink-0" />
            <h1 className="text-lg font-semibold text-foreground">Multi-Channel Priority Dispatch Center</h1>
          </div>
          <Badge variant="outline" className="border-primary text-primary bg-primary/5">
            {unreadCount} Unread Message{unreadCount === 1 ? "" : "s"}
          </Badge>
        </header>

        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
          {/* Dispatch Action Header */}
          <Card className="bg-gradient-to-r from-secondary/40 via-secondary/20 to-transparent border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base">Event Bus Orchestration</CardTitle>
                  <CardDescription>
                    Tureep AI+ utilizes a Redis-backed priority queue to dispatch alerts across in-app WebSockets, SendGrid (email), Firebase (mobile push), and Twilio (SMS).
                  </CardDescription>
                </div>
                <div className="flex gap-2.5">
                  <Button size="sm" variant="outline" onClick={load} disabled={loading}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Poll Ledger
                  </Button>
                  <Button size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Acknowledge All
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Dynamic Simulator Panel */}
          <Card className="border border-primary/20 bg-white">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4 text-primary flex-shrink-0" />
                Simulate Priority Dispatch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDispatch} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mockType">Communication Node</Label>
                    <Select value={mockType} onValueChange={setMockType}>
                      <SelectTrigger id="mockType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="push">Firebase Mobile Push (FCM)</SelectItem>
                        <SelectItem value="email">SendGrid Electronic Mail</SelectItem>
                        <SelectItem value="sms">Twilio Global SMS</SelectItem>
                        <SelectItem value="in_app">WebSocket In-App Toast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mockPriority">Queue Priority</Label>
                    <Select value={mockPriority} onValueChange={setMockPriority}>
                      <SelectTrigger id="mockPriority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High (P1 Instant Dispatch)</SelectItem>
                        <SelectItem value="urgent">Urgent (P0 Critical Flash)</SelectItem>
                        <SelectItem value="medium">Medium (Standard Batch)</SelectItem>
                        <SelectItem value="low">Low (Digest Deferred)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mockTitle">Dispatch Headline</Label>
                    <Input
                      id="mockTitle"
                      value={mockTitle}
                      onChange={(e) => setMockTitle(e.target.value)}
                      placeholder="e.g. SWIFT MT700 Confirmed"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="mockMessage">Payload Payload</Label>
                    <Input
                      id="mockMessage"
                      value={mockMessage}
                      onChange={(e) => setMockMessage(e.target.value)}
                      placeholder="e.g. Letter of credit issued by Garanti BBVA Istanbul for $7,500."
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">{error}</p>}
                {success && <p className="text-sm text-green-600 bg-green-50 p-2.5 rounded-lg border border-green-200">{success}</p>}

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={dispatching}>
                  {dispatching ? "Transmitting via event bus..." : "Broadcast Cryptographic Notification Payload"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notifications Ledger */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">My Active Inbox Ledger</h3>
            {loading ? (
              <p className="text-muted-foreground text-sm">Fetching immutable notifications...</p>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center bg-secondary/30 rounded-xl border border-border">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 font-medium text-foreground">Zero Dispatches</p>
                <p className="text-xs text-muted-foreground mt-1">Your communication queues are entirely silent.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border transition-all ${
                    n.read ? "bg-white border-border opacity-80" : "bg-primary/5 border-primary/30 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2.5 rounded-lg bg-secondary/80 flex-shrink-0 mt-0.5">
                      {typeIcons[n.type] || typeIcons.in_app}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-foreground">{n.title}</span>
                        <Badge variant={n.priority === "urgent" ? "destructive" : "secondary"} className="uppercase font-mono text-[10px]">
                          Priority: {n.priority}
                        </Badge>
                        <Badge variant="outline" className="uppercase font-mono text-[10px]">
                          Channel: {n.type.replace("_", "-")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">{n.message}</p>
                      <span className="text-[10px] font-mono text-muted-foreground block pt-1">
                        Dispatched: {new Date(n.created_at).toUTCString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {!n.read && (
                      <Button size="sm" onClick={() => handleMarkRead(n.id)} className="bg-primary hover:bg-primary/90 text-white text-xs py-1 h-8">
                        Acknowledge
                      </Button>
                    )}
                    {n.read && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Settled
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
