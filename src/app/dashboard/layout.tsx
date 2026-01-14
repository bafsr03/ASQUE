import { SubscriptionSyncWrapper } from "@/components/SubscriptionSyncWrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SubscriptionSyncWrapper>{children}</SubscriptionSyncWrapper>;
}
