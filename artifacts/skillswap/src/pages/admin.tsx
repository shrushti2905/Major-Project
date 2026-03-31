import { useState } from "react";
import { 
  useGetPlatformStats, getGetPlatformStatsQueryKey,
  useAdminGetUsers, getAdminGetUsersQueryKey,
  useAdminGetRequests, getAdminGetRequestsQueryKey,
  useAdminBlockUser, useAdminUnblockUser
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { ShieldCheck, Users, ArrowRightLeft, Search, Ban, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();

  const { data: stats } = useGetPlatformStats({
    query: { queryKey: getGetPlatformStatsQueryKey() }
  });

  const { data: usersData } = useAdminGetUsers(
    { search: debouncedSearch, limit: 50 },
    { query: { queryKey: getAdminGetUsersQueryKey({ search: debouncedSearch, limit: 50 }) } }
  );

  const { data: requestsData } = useAdminGetRequests(
    { limit: 50 } as any, // assuming API might accept limit, but using cast if types strict
    { query: { queryKey: getAdminGetRequestsQueryKey({ page: 1 }) } } // Default page 1 for now
  );

  const blockMutation = useAdminBlockUser();
  const unblockMutation = useAdminUnblockUser();

  const toggleBlock = (userId: number, isBlocked: boolean) => {
    const mutation = isBlocked ? unblockMutation : blockMutation;
    mutation.mutate({ data: { userId } } as any, {
      onSuccess: () => {
        toast.success(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully`);
        queryClient.invalidateQueries({ queryKey: getAdminGetUsersQueryKey({ search: debouncedSearch, limit: 50 }) });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 border-b pb-4 border-primary/20">
        <div className="bg-primary/10 p-3 rounded-lg">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Control Center</h1>
          <p className="text-muted-foreground">Manage the SkillSwap platform and oversee community activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card shadow-sm border-t-4 border-t-primary">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-t-4 border-t-secondary">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold">{stats?.activeUsers || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-t-4 border-t-accent-foreground">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold">{stats?.totalRequests || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm border-t-4 border-t-green-500">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Swaps</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-3xl font-bold">{stats?.completedSwaps || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md bg-card">
        <Tabs defaultValue="users" className="w-full">
          <div className="border-b px-6 py-2 bg-muted/10">
            <TabsList className="bg-background border">
              <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="w-4 h-4 mr-2" /> User Management
              </TabsTrigger>
              <TabsTrigger value="requests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ArrowRightLeft className="w-4 h-4 mr-2" /> Global Requests
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="users" className="p-0 m-0">
            <div className="p-4 border-b bg-muted/5">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users by name or email..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData?.users.map((user) => (
                    <TableRow key={user.id} className={user.isBlocked ? "bg-destructive/5" : ""}>
                      <TableCell className="font-mono text-xs">{user.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.isBlocked ? (
                          <Badge variant="destructive" className="bg-destructive/20 text-destructive border-none">Blocked</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-none dark:bg-green-900/30 dark:text-green-400">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role !== 'admin' && (
                          <Button 
                            variant={user.isBlocked ? "outline" : "ghost"} 
                            size="sm"
                            onClick={() => toggleBlock(user.id, user.isBlocked)}
                            className={user.isBlocked ? "text-green-600 hover:text-green-700" : "text-destructive hover:text-destructive hover:bg-destructive/10"}
                          >
                            {user.isBlocked ? <><CheckCircle className="w-4 h-4 mr-1"/> Unblock</> : <><Ban className="w-4 h-4 mr-1"/> Block</>}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="p-0 m-0">
             <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Receiver</TableHead>
                    <TableHead>Exchange</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Using any type assertion here as the generated types for AdminGetRequests Response might be different or returning an array directly */}
                  {((requestsData as any)?.requests || (Array.isArray(requestsData) ? requestsData : [])).map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-xs">{request.id}</TableCell>
                      <TableCell className="font-medium">{request.sender?.name || `User ${request.senderId}`}</TableCell>
                      <TableCell className="font-medium">{request.receiver?.name || `User ${request.receiverId}`}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <span className="font-semibold text-primary">{request.skillOffered}</span> 
                          <ArrowRightLeft className="w-3 h-3 inline mx-1 text-muted-foreground" />
                          <span className="font-semibold text-secondary-foreground">{request.skillRequested}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{request.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}