"use client";

import { useState } from "react";
import Image from "next/image";

interface RepresentativeImageProps {
  bioguideId: string;
  fullName: string;
  party: "D" | "R" | "I" | string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * RepresentativeImage Component
 * 
 * Displays representative photos with:
 * - Lazy loading via Next.js Image
 * - Fallback to initials avatar (colored by party)
 * - Error handling (no broken image icons)
 * - Support for Congress bioguide URLs
 */
export default function RepresentativeImage({
  bioguideId,
  fullName,
  party,
  photoUrl,
  size = "md",
  className = "",
}: RepresentativeImageProps) {
  const [imageError, setImageError] = useState(false);

  // Generate fallback initials from full name
  const getInitials = (name: string): string => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Get party color for initials avatar
  const getPartyColor = (p: string): { bg: string; text: string } => {
    switch (p) {
      case "D":
        return { bg: "bg-blue-500", text: "text-white" };
      case "R":
        return { bg: "bg-red-500", text: "text-white" };
      case "I":
        return { bg: "bg-purple-500", text: "text-white" };
      default:
        return { bg: "bg-slate-400", text: "text-white" };
    }
  };

  // Size mappings
  const sizeClasses = {
    sm: "w-12 h-12 text-sm",
    md: "w-16 h-16 text-lg",
    lg: "w-32 h-32 text-3xl md:w-44 md:h-44 md:text-4xl",
    xl: "w-48 h-48 text-5xl",
  };

  const borderClasses = {
    sm: "border-2",
    md: "border-2",
    lg: "border-4",
    xl: "border-4",
  };

  const colors = getPartyColor(party);
  const initials = getInitials(fullName);

  // Construct image URL (prefer photoUrl, fallback to bioguide pattern)
  // Only construct bioguide URL if photoUrl is explicitly provided (even if empty string)
  const imageUrl = photoUrl !== undefined && photoUrl !== null
    ? photoUrl || `https://bioguide.congress.gov/bioguide/photo/${bioguideId[0]}/${bioguideId}.jpg`
    : `https://bioguide.congress.gov/bioguide/photo/${bioguideId[0]}/${bioguideId}.jpg`;

  // If image failed to load, show initials avatar
  if (imageError) {
    return (
      <div
        className={`${sizeClasses[size]} ${colors.bg} ${colors.text} ${borderClasses[size]} border-white shadow-xl rounded-full flex items-center justify-center font-bold ${className}`}
        title={fullName}
        aria-label={`${fullName} - ${party === "D" ? "Democrat" : party === "R" ? "Republican" : "Independent"}`}
      >
        {initials}
      </div>
    );
  }

  // Show image with error fallback
  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <Image
        src={imageUrl}
        alt={fullName}
        fill
        sizes={size === "sm" ? "48px" : size === "md" ? "64px" : size === "lg" ? "176px" : "192px"}
        className={`rounded-full object-cover ${borderClasses[size]} border-white shadow-xl`}
        onError={() => setImageError(true)}
        loading="lazy"
        unoptimized // bioguide.congress.gov doesn't support Next.js image optimization
      />
    </div>
  );
}
