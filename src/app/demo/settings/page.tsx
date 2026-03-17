import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DemoSettingsPage() {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
        <p className="text-navy-300 mt-1">Demo mode - Settings features are available in the full version</p>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Settings Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 rounded-lg border border-navy-700/50 bg-navy-900/30">
            <p className="text-navy-200 text-center">
              In the full version, you would be able to:
            </p>
            <ul className="mt-4 space-y-2 text-navy-300 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full" />
                Manage your account profile and preferences
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full" />
                Configure email and notification settings
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full" />
                Set up integrations and API keys
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full" />
                Manage team members and permissions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gold-500 rounded-full" />
                View billing and subscription details
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
