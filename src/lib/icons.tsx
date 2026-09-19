import React from "react";
import {
  Activity,
  Award,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Coffee,
  Compass,
  Droplets,
  FileText,
  Flower2,
  Globe,
  Heart,
  HeartHandshake,
  Leaf,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Moon,
  Phone,
  Shield,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Sun,
  ThumbsUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** Icons the admin can pick for cards (values, trust badges, contact details…). */
export const ICONS: Record<string, LucideIcon> = {
  Activity,
  Award,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Coffee,
  Compass,
  Droplets,
  FileText,
  Flower2,
  Globe,
  Heart,
  HeartHandshake,
  Leaf,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Moon,
  Phone,
  Shield,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Sun,
  ThumbsUp,
  Users,
  Zap,
};

export const ICON_NAMES = Object.keys(ICONS);

export function DynamicIcon({
  name,
  className,
  fallback = "Sparkles",
}: {
  name?: string;
  className?: string;
  fallback?: string;
}) {
  const Icon = (name && ICONS[name]) || ICONS[fallback] || Sparkles;
  return <Icon className={className} />;
}
