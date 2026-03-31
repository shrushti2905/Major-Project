import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateProfile } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { UserCircle } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  location: z.string().optional(),
  profileImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  skillsOffered: z.string().min(1, "Enter at least one skill you can offer"),
  skillsWanted: z.string().min(1, "Enter at least one skill you want to learn"),
});

export default function Profile() {
  const { user } = useAuth();
  const updateMutation = useUpdateProfile();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      bio: "",
      location: "",
      profileImage: "",
      skillsOffered: "",
      skillsWanted: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        bio: user.bio || "",
        location: user.location || "",
        profileImage: user.profileImage || "",
        skillsOffered: user.skillsOffered.join(", "),
        skillsWanted: user.skillsWanted.join(", "),
      });
    }
  }, [user, form]);

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    const formattedData = {
      ...data,
      profileImage: data.profileImage || undefined,
      skillsOffered: data.skillsOffered.split(",").map(s => s.trim()).filter(Boolean),
      skillsWanted: data.skillsWanted.split(",").map(s => s.trim()).filter(Boolean),
    };

    updateMutation.mutate({ data: formattedData }, {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        // Refresh handled by invalidateQueries in auth context
      },
      onError: () => {
        toast.error("Failed to update profile.");
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">Manage your public persona and skills.</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="bg-muted/20 border-b">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-background shadow-md">
              <AvatarImage src={form.watch("profileImage")} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {user?.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user?.name}</CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                <UserCircle className="w-4 h-4" /> {user?.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-muted/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} className="bg-muted/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="profileImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.jpg" {...field} className="bg-muted/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell others a bit about yourself and why you're here..." 
                        className="resize-none h-24 bg-muted/50" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t space-y-6">
                <h3 className="text-lg font-medium text-primary">Skill Exchange</h3>
                <FormField
                  control={form.control}
                  name="skillsOffered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills you offer</FormLabel>
                      <FormDescription>Comma separated list of things you can teach others.</FormDescription>
                      <FormControl>
                        <Input placeholder="e.g. Graphic Design, React, Baking" {...field} className="bg-muted/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="skillsWanted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills you want</FormLabel>
                      <FormDescription>Comma separated list of things you want to learn.</FormDescription>
                      <FormControl>
                        <Input placeholder="e.g. Photography, Spanish, Yoga" {...field} className="bg-muted/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={updateMutation.isPending} className="px-8 rounded-full h-11">
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}