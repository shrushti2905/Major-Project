import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetUserById, getGetUserByIdQueryKey, useCreateRequest } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { MapPin, Calendar, BookOpen, ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/lib/auth";

const requestSchema = z.object({
  skillOffered: z.string().min(1, "Select a skill you will offer"),
  skillRequested: z.string().min(1, "Select a skill you want from them"),
  message: z.string().optional(),
});

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: profileUser, isLoading } = useGetUserById(Number(id), {
    query: { queryKey: getGetUserByIdQueryKey(Number(id)), enabled: !!id }
  });

  const createRequestMutation = useCreateRequest();

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      skillOffered: "",
      skillRequested: "",
      message: "",
    },
  });

  const onSubmit = (data: z.infer<typeof requestSchema>) => {
    createRequestMutation.mutate({ 
      data: {
        receiverId: Number(id),
        ...data
      } 
    }, {
      onSuccess: () => {
        toast.success("Swap request sent!");
        setIsDialogOpen(false);
        form.reset();
      },
      onError: (err: any) => {
        toast.error(err.data?.message || "Failed to send request");
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!profileUser) return <div className="p-8 text-center">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <Link href="/explore" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to explore
      </Link>

      <Card className="overflow-hidden border-none shadow-md">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent relative"></div>
        <CardContent className="px-6 sm:px-10 pb-10 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-8">
            <Avatar className="h-32 w-32 border-4 border-card shadow-lg bg-card">
              <AvatarImage src={profileUser.profileImage} />
              <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">{profileUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold tracking-tight">{profileUser.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground mt-2">
                {profileUser.location && (
                  <span className="flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="h-4 w-4" /> {profileUser.location}
                  </span>
                )}
                <span className="flex items-center justify-center sm:justify-start gap-1">
                  <Calendar className="h-4 w-4" /> Joined {new Date(profileUser.createdAt).toLocaleDateString(undefined, {month: 'long', year: 'numeric'})}
                </span>
              </div>
            </div>
            {currentUser?.id !== profileUser.id && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="rounded-full px-8 shadow-md hover-elevate">
                    Request Swap
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Propose a Skill Swap</DialogTitle>
                    <DialogDescription>
                      Propose an exchange to {profileUser.name}. Select what you'll teach and what you want to learn.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="skillRequested"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>I want to learn</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-muted/50 border-primary/20">
                                    <SelectValue placeholder="Select skill" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {profileUser.skillsOffered.map(skill => (
                                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="skillOffered"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>I will teach</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-muted/50 border-secondary/20">
                                    <SelectValue placeholder="Select skill" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {currentUser?.skillsOffered.map(skill => (
                                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder={`Hi ${profileUser.name.split(' ')[0]}, I'd love to swap my skills for your...`}
                                className="resize-none h-24"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" className="w-full h-11" disabled={createRequestMutation.isPending}>
                          {createRequestMutation.isPending ? "Sending..." : <><Send className="w-4 h-4 mr-2" /> Send Request</>}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-3">About Me</h3>
                <div className="p-4 bg-muted/20 rounded-xl border">
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {profileUser.bio || "This user hasn't written a bio yet."}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="p-5 bg-primary/5 rounded-xl border border-primary/10">
                <div className="flex items-center gap-2 mb-4 text-primary font-bold">
                  <BookOpen className="h-5 w-5" />
                  <h3>Skills Offered</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileUser.skillsOffered.map(skill => (
                    <Badge key={skill} className="bg-primary/90 text-primary-foreground text-sm py-1 px-3">
                      {skill}
                    </Badge>
                  ))}
                  {profileUser.skillsOffered.length === 0 && <span className="text-sm text-muted-foreground">None listed</span>}
                </div>
              </div>

              <div className="p-5 bg-secondary/10 rounded-xl border border-secondary/20">
                <div className="flex items-center gap-2 mb-4 text-secondary-foreground font-bold">
                  <BookOpen className="h-5 w-5" />
                  <h3>Skills Wanted</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileUser.skillsWanted.map(skill => (
                    <Badge key={skill} variant="secondary" className="bg-secondary/40 text-secondary-foreground hover:bg-secondary/50 text-sm py-1 px-3 border border-secondary/20">
                      {skill}
                    </Badge>
                  ))}
                  {profileUser.skillsWanted.length === 0 && <span className="text-sm text-muted-foreground">None listed</span>}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}