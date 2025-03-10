
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Check, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getBadgeVariant, getBadgeText, isRecent } from "./utils";
import type { Announcement } from "./utils";

interface AnnouncementItemProps {
  announcement: Announcement;
  isRead: boolean;
  onMarkRead: (id: number) => void;
  index: number;
  groupIndex: number;
}

export const AnnouncementItem = ({
  announcement,
  isRead,
  onMarkRead,
  index,
  groupIndex,
}: AnnouncementItemProps) => {
  const navigate = useNavigate();

  const handleActionClick = () => {
    if (!announcement.action) return;
    
    // Check if the action is an external URL
    if (announcement.action.startsWith('http') || announcement.action.includes('.')) {
      window.open(announcement.action, '_blank');
    } else {
      // Internal route
      navigate(announcement.action);
    }
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(announcement.date));

  return (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: (groupIndex + index) * 0.1 }}
    className={`relative rounded-lg border bg-card text-card-foreground shadow-sm p-6 hover:shadow-lg transition-all duration-200 
      ${announcement.is_highlighted 
        ? "border-2 border-primary ring-2 ring-primary/20 bg-primary/5" 
        : "border-border"
      }`}
  >

    {/* Star */}
    {announcement.is_highlighted && (
      <div className="absolute top-3 left-3">
        <Star className="h-5 w-5 text-primary animate-pulse" />
      </div>
    )}

    {/* Title */}
    <h3 className="text-lg font-semibold text-foreground mt-2">
      {announcement.title}
    </h3>

    {/* Badges (Announcement, Update, New) */}
    <div className="flex gap-2 mt-2">
      <Badge variant={getBadgeVariant(announcement.type)}>
        {getBadgeText(announcement.type)}
      </Badge>
      {isRecent(announcement.date) && (
        <Badge variant="default" className="bg-primary hover:bg-primary">
          New
        </Badge>
      )}
    </div>

    {/* Announcement Content */}
    <p className="text-muted-foreground mt-2">
      {announcement.content}
    </p>

    {/* Button */}
    {announcement.action && (
      <Button
        onClick={handleActionClick}
        className="mt-4 gap-2"
        variant="outline"
        size="sm"
      >
        Try it now
        {(announcement.action.startsWith('http') || announcement.action.includes('.')) && (
          <ExternalLink className="h-4 w-4" />
        )}
      </Button>
    )}

    {/*Footer */}
    <div className="flex justify-between items-center mt-4">
      <p className="text-sm text-muted-foreground">{formattedDate}</p>

      {/* <Button
        variant="ghost"
        size="icon"
        className={`${isRead ? 'text-primary' : 'text-muted-foreground'}`}
        onClick={() => onMarkRead(announcement.id)}
      >
        <Check className="h-4 w-4" />
      </Button> */}
    </div>

  </motion.div>
  );
};
