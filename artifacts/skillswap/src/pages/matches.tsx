import { useGetSkillMatches, getGetSkillMatchesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, User, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Matches() {
  const { data: matches, isLoading } = useGetSkillMatches({
    query: { queryKey: getGetSkillMatchesQueryKey() }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Your Matches</h1>
        <p className="text-muted-foreground">People whose offered skills align with what you want to learn.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
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
      ) : matches?.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No matches yet</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto">We couldn't find any direct matches right now. Try adding more skills to your wanted list to find more people!</p>
          <Link href="/profile">
            <Button variant="outline" className="mt-4">Update Profile</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {matches?.map(user => (
            <Link key={user.id} href={`/users/${user.id}`}>
              <Card className="h-full cursor-pointer hover:shadow-md transition-shadow group overflow-hidden border-primary/20 flex flex-col relative">
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow-sm z-10 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Match Score: {user.matchScore}
                </div>
                <div className="h-20 bg-gradient-to-r from-primary/10 to-primary/30 relative group-hover:from-primary/20 group-hover:to-primary/40 transition-colors"></div>
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
                  
                  <div className="bg-primary/5 p-3 rounded-md mb-4 mt-2">
                    <div className="text-[10px] uppercase font-bold text-primary tracking-wider mb-1.5">They can teach you</div>
                    <div className="flex flex-wrap gap-1">
                      {user.matchingSkills.map(skill => (
                        <Badge key={skill} className="bg-primary hover:bg-primary/90">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-auto">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1.5">All Offers</div>
                      <div className="flex flex-wrap gap-1">
                        {user.skillsOffered.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="secondary" className="bg-muted text-foreground font-normal">{skill}</Badge>
                        ))}
                        {user.skillsOffered.length > 3 && (
                          <Badge variant="outline" className="text-muted-foreground font-normal">+{user.skillsOffered.length - 3}</Badge>
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