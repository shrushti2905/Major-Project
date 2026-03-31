import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useGetPlatformStats, 
  getGetPlatformStatsQueryKey,
  useGetRecentActivity,
  getGetRecentActivityQueryKey,
  useGetSkillMatches,
  getGetSkillMatchesQueryKey,
  useGetNotifications,
  getGetNotificationsQueryKey
} from "@workspace/api-client-react";
import { ArrowRight, UserPlus, Inbox, Activity, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = useGetPlatformStats({
    query: { queryKey: getGetPlatformStatsQueryKey() }
  });
  
  const { data: activities, isLoading: activityLoading } = useGetRecentActivity({
    query: { queryKey: getGetRecentActivityQueryKey() }
  });

  const { data: matches, isLoading: matchesLoading } = useGetSkillMatches({
    query: { queryKey: getGetSkillMatchesQueryKey() }
  });

  const { data: notifications } = useGetNotifications({
    query: { queryKey: getGetNotificationsQueryKey() }
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your skill exchange network.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/explore">
            <Button className="rounded-full shadow-sm hover-elevate">
              <Search className="mr-2 h-4 w-4" /> Find Skills
            </Button>
          </Link>
          <Link href="/requests">
            <Button variant="outline" className="rounded-full shadow-sm bg-card hover-elevate relative">
              <Inbox className="mr-2 h-4 w-4" /> Requests
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
              )}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium opacity-90 flex items-center gap-2">
              <Star className="h-5 w-5" /> Top Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {matchesLoading ? (
              <Skeleton className="h-10 w-24 bg-primary-foreground/20" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{matches?.length || 0}</span>
                <span className="text-primary-foreground/80 text-sm">users found</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-secondary text-secondary-foreground border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium opacity-90 flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Platform Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-10 w-24 bg-secondary-foreground/20" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{stats?.totalUsers || 0}</span>
                <span className="text-secondary-foreground/80 text-sm">active</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-5 w-5" /> Total Exchanges
            </CardTitle>
          </CardHeader>
          <CardContent>
             {statsLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">{stats?.completedSwaps || 0}</span>
                <span className="text-muted-foreground text-sm">completed</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div>
              <CardTitle>Recommended Matches</CardTitle>
              <CardDescription>People who have skills you want and want skills you have.</CardDescription>
            </div>
            <Link href="/matches">
              <Button variant="ghost" size="sm" className="text-primary">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {matchesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : matches?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No direct matches found right now.</p>
                <p className="text-sm mt-1">Try adding more skills to your profile.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches?.slice(0, 4).map(match => (
                  <div key={match.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {match.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{match.name}</div>
                        <div className="text-xs text-muted-foreground flex gap-1 mt-1">
                          {match.matchingSkills.slice(0, 2).map(s => (
                            <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {s}
                            </Badge>
                          ))}
                          {match.matchingSkills.length > 2 && <span className="text-[10px] text-muted-foreground">+{match.matchingSkills.length - 2}</span>}
                        </div>
                      </div>
                    </div>
                    <Link href={`/users/${match.id}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div>
              <CardTitle>Recent Community Activity</CardTitle>
              <CardDescription>Live pulse of the SkillSwap bazaar.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {activityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : activities?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity.</p>
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {activities?.slice(0, 5).map(activity => (
                  <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-primary bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    </div>
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border bg-card shadow-sm">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Ensure Search icon is imported for the dashboard header
import { Search } from "lucide-react";