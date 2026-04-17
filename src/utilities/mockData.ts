import type { ServiceCategory } from "../types";

export const MOCK_CATEGORIES: ServiceCategory[] = [
  { id: "quick_fixes", name: "Quick Fixes", icon: "🛠️" },
  { id: "plumbing_help", name: "Plumbing Help", icon: "🚰" },
  { id: "assembly", name: "Assembly", icon: "🪛" },
  { id: "mounting", name: "Mounting", icon: "🖼️" },
  { id: "moving_help", name: "Moving Help", icon: "📦" },
  { id: "yard_help", name: "Yard Help", icon: "🌿" },
  { id: "clean_up", name: "Clean Up", icon: "🧹" },
  { id: "painting_touchups", name: "Paint Touch-Ups", icon: "🎨" },
  { id: "appliance_setup", name: "Appliance Setup", icon: "🔌" },
  { id: "other", name: "Other", icon: "✨" },
];

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: "Posted",
    accepted: "Matched",
    inspection: "Visit scheduled",
    quote_provided: "Price sent",
    en_route: "On the way",
    in_progress: "Working",
    awaiting_customer: "Confirm done",
    completed: "Done",
    cancelled: "Cancelled",
  };
  return labels[status] ?? status;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: "#f59e0b",
    accepted: "#3b82f6",
    inspection: "#8b5cf6",
    quote_provided: "#f97316",
    en_route: "#06b6d4",
    in_progress: "#10b981",
    awaiting_customer: "#a855f7",
    completed: "#22c55e",
    cancelled: "#ef4444",
  };
  return colors[status] ?? "#6b7280";
};
