import React from "react";
import { cn } from "../../utils/cn";
import { getTagColor, categorizeTag } from "../../utils/tag-utils";

interface TagChipProps {
  tag: string;
  category?: string;
  className?: string;
  children?: React.ReactNode; // For close/remove button
}

export function TagChip({ tag, category, className, children }: TagChipProps) {
  // If category is not provided, infer it from the tag
  const cat = category || categorizeTag(tag).category;
  const colorClass = getTagColor(cat);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium",
        colorClass,
        className
      )}
    >
      {tag}
      {children}
    </span>
  );
} 