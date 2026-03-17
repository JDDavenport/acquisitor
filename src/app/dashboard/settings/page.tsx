"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Palette, Mail, Building2 } from "lucide-react";

const sections = [
  {
    icon: User,
    title: "Profile",
    description: "Manage your personal information",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-navy-200">Full Name</Label>
            <Input defaultValue="JD Davenport" className="bg-navy-800 border-navy-700 text-white focus:border-gold-500" />
          </div>
          <div className="space-y-2">
            <Label className="text-navy-200">Email</Label>
            <Input defaultValue="jd@acquisitor.com" className="bg-navy-800 border-navy-700 text-white focus:border-gold-500" />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-navy-200">Company</Label>
          <Input defaultValue="Davenport Capital" className="bg-navy-800 border-navy-700 text-white focus:border-gold-500" />
        </div>
        <Button className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-semibold">Save Changes</Button>
      </div>
    ),
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Configure how you receive alerts",
    content: (
      <div className="space-y-4">
        {["New leads matching criteria", "Deal stage changes", "Email responses", "Weekly summary report"].map((item) => (
          <div key={item} className="flex items-center justify-between py-2">
            <span className="text-navy-200 text-sm">{item}</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Active</Badge>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Shield,
    title: "Security",
    description: "Manage your account security",
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-navy-200 text-sm font-medium">Two-Factor Authentication</p>
            <p className="text-navy-400 text-xs">Add an extra layer of security</p>
          </div>
          <Button variant="outline" size="sm" className="border-navy-700 text-navy-200 hover:bg-navy-700 bg-transparent">Enable</Button>
        </div>
        <Separator className="bg-navy-700/50" />
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-navy-200 text-sm font-medium">Change Password</p>
            <p className="text-navy-400 text-xs">Last changed 30 days ago</p>
          </div>
          <Button variant="outline" size="sm" className="border-navy-700 text-navy-200 hover:bg-navy-700 bg-transparent">Update</Button>
        </div>
      </div>
    ),
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl animate-slide-up">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
        <p className="text-navy-300 mt-1">Manage your account preferences</p>
      </div>

      {sections.map((section) => (
        <Card key={section.title} className="border-navy-700/50 bg-navy-800/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-navy-700/50">
                <section.icon className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">{section.title}</CardTitle>
                <CardDescription className="text-navy-400">{section.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>{section.content}</CardContent>
        </Card>
      ))}
    </div>
  );
}
