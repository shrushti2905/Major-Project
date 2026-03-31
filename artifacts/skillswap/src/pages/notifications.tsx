import { 
  useGetNotifications, 
  getGetNotificationsQueryKey,
  useMarkNotificationRead,
  useMarkAllNotificationsRead
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, Check, ArrowRightLeft, UserPlus, Info } from "lucide-react";

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useGetNotifications({
    query: { queryKey: getGetNotificationsQueryKey() }
  });

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const handleMarkRead = (id: number) => {
    markReadMutation.mutate({ data: { notificationId: id } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
      }
    });
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
      }
    });
  };

  const getIcon = (type?: string) => {
    switch(type) {
      case 'request_received': return <ArrowRightLeft className="h-5 w-5 text-primary" />;
      case 'request_accepted': return <Check className="h-5 w-5 text-green-500" />;
      case 'match_found': return <UserPlus className="h-5 w-5 text-secondary" />;
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const hasUnread = notifications?.some(n => !n.isRead);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on your connections.</p>
        </div>
        {hasUnread && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markAllReadMutation.isPending}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Card key={i} className="h-20 bg-muted animate-pulse border-none"></Card>)}
          </div>
        ) : notifications?.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">All caught up!</h3>
            <p className="text-muted-foreground mt-1">You have no new notifications.</p>
          </div>
        ) : (
          notifications?.map(notification => (
            <Card 
              key={notification.id} 
              className={`p-4 flex gap-4 transition-colors ${notification.isRead ? 'bg-background opacity-70' : 'bg-card border-primary/20 shadow-sm'}`}
            >
              <div className={`mt-1 flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${notification.isRead ? 'bg-muted' : 'bg-primary/10'}`}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${notification.isRead ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(notification.createdAt).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  })}
                </p>
              </div>
              {!notification.isRead && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary shrink-0" onClick={() => handleMarkRead(notification.id)}>
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}