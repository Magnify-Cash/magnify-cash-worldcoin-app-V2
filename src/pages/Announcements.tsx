
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { AnnouncementGroup } from "@/features/announcements/AnnouncementGroup";
import { groupAnnouncementsByMonth } from "@/features/announcements/utils";

const Announcements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is authenticated
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log(
        "Session status:",
        session ? "Authenticated" : "Not authenticated"
      );
      return session;
    },
  });

  const { data: announcements, isLoading: isLoadingAnnouncements } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      console.log("Fetching announcements...");
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching announcements:", error);
        throw error;
      }

      console.log("Fetched announcements:", data);
      return data;
    },
  });

  const { data: readAnnouncements } = useQuery({
    queryKey: ["announcement-reads"],
    queryFn: async () => {
      if (!session?.user) return [];

      const { data, error } = await supabase
        .from("user_announcement_reads")
        .select("announcement_id")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error fetching read announcements:", error);
        throw error;
      }

      console.log("Fetched read announcements:", data);
      return data.map((read) => read.announcement_id);
    },
    enabled: !!session?.user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (announcementId: number) => {
      if (!session?.user) throw new Error("User not authenticated");

      const { error } = await supabase.from("user_announcement_reads").upsert({
        user_id: session.user.id,
        announcement_id: announcementId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcement-reads"] });
      toast({
        title: "Marked as read",
        description: "This announcement has been marked as read",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark announcement as read",
        variant: "destructive",
      });
      console.error("Error marking announcement as read:", error);
    },
  });

  const isRead = (id: number) => readAnnouncements?.includes(id) ?? false;

  if (isLoadingAnnouncements) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Announcements" showBack={false} />
        <div className="container max-w-2xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  console.log("Rendering announcements:", announcements);
  const groupedAnnouncements = groupAnnouncementsByMonth(announcements || []);
  console.log("Grouped announcements:", groupedAnnouncements);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Announcements" showBack={false} />

      <div className="container max-w-2xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {groupedAnnouncements.map(([monthYear, monthAnnouncements], groupIndex) => (
          <AnnouncementGroup
            key={monthYear}
            monthYear={monthYear}
            announcements={monthAnnouncements}
            groupIndex={groupIndex}
            isRead={isRead}
            onMarkRead={(id) => {
              if (!session?.user) {
                toast({
                  title: "Authentication required",
                  description: "Please sign in to mark announcements as read",
                  variant: "destructive",
                });
                return;
              }
              markAsReadMutation.mutate(id);
            }}
          />
        ))}

        <div className="flex justify-center pt-4 sm:pt-6">
          <Button
            onClick={() => navigate("/wallet")}
            className="w-full sm:w-auto px-8"
            size="lg"
          >
            Go to Wallet
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
