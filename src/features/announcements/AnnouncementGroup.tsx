
import { motion } from "framer-motion";
import { AnnouncementItem } from "./AnnouncementItem";
import type { Announcement } from "./utils";

interface AnnouncementGroupProps {
  monthYear: string;
  announcements: Announcement[];
  groupIndex: number;
  isRead: (id: number) => boolean;
  onMarkRead: (id: number) => void;
}

export const AnnouncementGroup = ({
  monthYear,
  announcements,
  groupIndex,
  isRead,
  onMarkRead,
}: AnnouncementGroupProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: groupIndex * 0.1 }}
    >
      <h2 className="text-xl font-semibold mb-4 text-foreground">{monthYear}</h2>
      <div className="space-y-4">
        {announcements.map((announcement, index) => (
          <AnnouncementItem
            key={announcement.id}
            announcement={announcement}
            isRead={isRead(announcement.id)}
            onMarkRead={onMarkRead}
            index={index}
            groupIndex={groupIndex}
          />
        ))}
      </div>
    </motion.div>
  );
};
