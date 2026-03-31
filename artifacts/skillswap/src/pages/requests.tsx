import { useState } from "react";
import { 
  useGetRequests, 
  getGetRequestsQueryKey,
  useAcceptRequest,
  useRejectRequest,
  useCompleteRequest
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRightLeft, CheckCircle2, XCircle, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export default function Requests() {
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: requests, isLoading } = useGetRequests({ type: activeTab }, {
    query: { queryKey: getGetRequestsQueryKey({ type: activeTab }) }
  });

  const acceptMutation = useAcceptRequest();
  const rejectMutation = useRejectRequest();
  const completeMutation = useCompleteRequest();

  const invalidateRequests = () => {
    queryClient.invalidateQueries({ queryKey: getGetRequestsQueryKey({ type: "received" }) });
    queryClient.invalidateQueries({ queryKey: getGetRequestsQueryKey({ type: "sent" }) });
  };

  const handleAccept = (id: number) => {
    acceptMutation.mutate({ data: { requestId: id } }, {
      onSuccess: () => {
        toast.success("Request accepted!");
        invalidateRequests();
      }
    });
  };

  const handleReject = (id: number) => {
    rejectMutation.mutate({ data: { requestId: id } }, {
      onSuccess: () => {
        toast.success("Request declined.");
        invalidateRequests();
      }
    });
  };

  const handleComplete = (id: number) => {
    completeMutation.mutate({ data: { requestId: id } }, {
      onSuccess: () => {
        toast.success("Exchange marked as complete!");
        invalidateRequests();
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>;
      case "accepted": return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Accepted</Badge>;
      case "rejected": return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Declined</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Swap Requests</h1>
        <p className="text-muted-foreground">Manage your incoming and outgoing skill exchange proposals.</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
          <TabsTrigger value="received" className="text-base">Inbox (Received)</TabsTrigger>
          <TabsTrigger value="sent" className="text-base">Sent</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="w-full">
                <CardHeader>
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
          ) : requests?.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
              <ArrowRightLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No requests found</h3>
              <p className="text-muted-foreground mt-1">You don't have any {activeTab} requests right now.</p>
            </div>
          ) : (
            requests?.map(request => {
              const otherUser = activeTab === "received" ? request.sender : request.receiver;
              if (!otherUser) return null;

              return (
                <Card key={request.id} className={`overflow-hidden transition-all ${request.status === 'pending' && activeTab === 'received' ? 'border-primary/50 shadow-md ring-1 ring-primary/20' : 'opacity-90'}`}>
                  <CardHeader className="pb-3 bg-muted/30">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                          <AvatarImage src={otherUser.profileImage || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">{otherUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {activeTab === "received" ? `${otherUser.name} wants to swap` : `You asked ${otherUser.name} to swap`}
                            {getStatusBadge(request.status)}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" /> {new Date(request.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-6 px-4 py-4 rounded-xl border bg-card relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background border flex items-center justify-center z-10 hidden md:flex">
                        <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 text-center md:text-right w-full">
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">They teach</div>
                        <Badge className="text-base py-1 px-4 bg-primary text-primary-foreground">
                          {activeTab === "received" ? request.skillOffered : request.skillRequested}
                        </Badge>
                      </div>

                      <div className="flex-1 text-center md:text-left w-full border-t pt-4 mt-2 md:border-t-0 md:pt-0 md:mt-0">
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">You teach</div>
                        <Badge className="text-base py-1 px-4 bg-secondary text-secondary-foreground">
                          {activeTab === "received" ? request.skillRequested : request.skillOffered}
                        </Badge>
                      </div>
                    </div>

                    {request.message && (
                      <div className="bg-muted/30 p-4 rounded-lg italic text-muted-foreground border-l-4 border-l-primary/30">
                        "{request.message}"
                      </div>
                    )}
                  </CardContent>
                  
                  {(request.status === 'pending' && activeTab === 'received') && (
                    <CardFooter className="bg-muted/20 border-t pt-4 flex justify-end gap-3">
                      <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => handleReject(request.id)} disabled={rejectMutation.isPending}>
                        <XCircle className="w-4 h-4 mr-2" /> Decline
                      </Button>
                      <Button className="bg-primary hover:bg-primary/90" onClick={() => handleAccept(request.id)} disabled={acceptMutation.isPending}>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Accept Swap
                      </Button>
                    </CardFooter>
                  )}

                  {(request.status === 'accepted') && (
                    <CardFooter className="bg-muted/20 border-t pt-4 flex justify-end gap-3">
                      <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleComplete(request.id)} disabled={completeMutation.isPending}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Mark Completed
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}