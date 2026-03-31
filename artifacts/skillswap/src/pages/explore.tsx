import { useState } from "react";
import { useGetUsers, getGetUsersQueryKey, useGetTopSkills, getGetTopSkillsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, SlidersHorizontal, User } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

// Custom hook to debounce inputs (mocking it inline or better yet creating it)
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]); // need useEffect here really, let's fix below
}

import { useEffect } from "react";
function useDebounceHook<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const debouncedSearch = useDebounceHook(searchTerm, 500);

  const { data: topSkills } = useGetTopSkills({
    query: { queryKey: getGetTopSkillsQueryKey() }
  });

  const { data, isLoading } = useGetUsers(
    { search: debouncedSearch, skill: skillFilter, limit: 20 },
    { query: { queryKey: getGetUsersQueryKey({ search: debouncedSearch, skill: skillFilter, limit: 20 }) } }
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Explore the Bazaar</h1>
        <p className="text-muted-foreground">Find the perfect partner to learn your next skill from.</p>
      </div>

      <Card className="bg-card border-none shadow-sm shadow-primary/5">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, bio, or skills..." 
              className="pl-9 h-12 bg-muted/50 rounded-full border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <Button 
              variant={skillFilter === "" ? "default" : "outline"} 
              className="rounded-full whitespace-nowrap"
              onClick={() => setSkillFilter("")}
              size="sm"
            >
              All Skills
            </Button>
            {topSkills?.slice(0, 6).map(item => (
              <Button 
                key={item.skill}
                variant={skillFilter === item.skill ? "default" : "outline"} 
                className="rounded-full whitespace-nowrap"
                onClick={() => setSkillFilter(item.skill)}
                size="sm"
              >
                {item.skill} ({item.count})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Card key={i} className="overflow-hidden">
              <div className="h-24 bg-muted animate-pulse"></div>
              <CardContent className="pt-12 relative">
                <div className="absolute -top-10 left-6 h-16 w-16 rounded-full bg-border animate-pulse border-4 border-card"></div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.users.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No users found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your search terms or filters.</p>
          {(searchTerm || skillFilter) && (
            <Button variant="link" onClick={() => { setSearchTerm(""); setSkillFilter(""); }} className="mt-4 text-primary">
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.users.map(user => (
            <Link key={user.id} href={`/users/${user.id}`}>
              <Card className="h-full cursor-pointer hover:shadow-md transition-shadow group overflow-hidden border-border flex flex-col">
                <div className="h-20 bg-gradient-to-r from-primary/10 to-secondary/10 relative group-hover:from-primary/20 group-hover:to-secondary/20 transition-colors"></div>
                <CardContent className="pt-0 relative flex-1 flex flex-col">
                  <div className="absolute -top-8 left-4 h-16 w-16 rounded-full bg-card border-4 border-card flex items-center justify-center text-xl font-bold text-primary shadow-sm overflow-hidden">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="mt-10 mb-2">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{user.name}</h3>
                    {user.location && (
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {user.location}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {user.bio || "No bio provided."}
                  </p>
                  
                  <div className="space-y-3 mt-auto">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1.5">Offers</div>
                      <div className="flex flex-wrap gap-1">
                        {user.skillsOffered.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{skill}</Badge>
                        ))}
                        {user.skillsOffered.length > 3 && (
                          <Badge variant="outline" className="text-muted-foreground">+{user.skillsOffered.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1.5">Wants</div>
                      <div className="flex flex-wrap gap-1">
                        {user.skillsWanted.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-secondary/10 text-secondary-foreground hover:bg-secondary/20">{skill}</Badge>
                        ))}
                        {user.skillsWanted.length > 3 && (
                          <Badge variant="outline" className="text-muted-foreground">+{user.skillsWanted.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}