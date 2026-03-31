import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSignup } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  skillsOffered: z.string().min(1, "Enter at least one skill you can offer"),
  skillsWanted: z.string().min(1, "Enter at least one skill you want to learn"),
});

export default function Signup() {
  const [, setLocation] = useLocation();
  const { login: setAuthToken } = useAuth();
  const signupMutation = useSignup();
  const [errorMsg, setErrorMsg] = useState("");

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      skillsOffered: "",
      skillsWanted: "",
    },
  });

  const onSubmit = (data: z.infer<typeof signupSchema>) => {
    setErrorMsg("");
    
    // Convert comma separated strings to arrays
    const formattedData = {
      ...data,
      skillsOffered: data.skillsOffered.split(",").map(s => s.trim()).filter(Boolean),
      skillsWanted: data.skillsWanted.split(",").map(s => s.trim()).filter(Boolean),
    };

    signupMutation.mutate({ data: formattedData }, {
      onSuccess: (response) => {
        setAuthToken(response.token);
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        setErrorMsg(err.data?.message || err.message || "Failed to create account.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-lg shadow-lg border-secondary/20">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight text-secondary-foreground">Join the Bazaar</CardTitle>
          <CardDescription className="text-base mt-2">Create an account to start trading skills.</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMsg && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} className="bg-card" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="jane@example.com" {...field} className="bg-card" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Min. 6 characters" {...field} className="bg-card" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skillsOffered"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills you can offer (comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. JavaScript, Guitar, SEO" {...field} className="bg-card" />
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
                    <FormLabel>Skills you want to learn (comma separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Spanish, UI Design, Cooking" {...field} className="bg-card" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-12 text-lg rounded-full mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90" disabled={signupMutation.isPending}>
                {signupMutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-secondary-foreground font-semibold hover:underline">
              Log in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
