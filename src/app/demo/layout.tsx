import DashboardLayoutClient from "@/app/dashboard/layout-client";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demoUser = { name: "Demo User", email: "demo@acquisitor.com" };
  return (
    <DashboardLayoutClient user={demoUser} basePath="/demo">
      {children}
    </DashboardLayoutClient>
  );
}
