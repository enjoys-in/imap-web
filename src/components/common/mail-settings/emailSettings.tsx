"use client"

import { useState } from "react"
import { InfoIcon as InfoCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EmailSettings() {
  const [settings, setSettings] = useState({
    autoShowImages: true,
    keepMessages: false,
    excludeSpam: true,
    confirmLinks: true,
    conversationGrouping: true,
    autoDeleteUnwanted: false,
    stickyLabels: false,
  })

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-12">
        {/* Messages Section */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Messages</h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Auto show embedded images</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Switch
              checked={settings.autoShowImages}
              onCheckedChange={(checked) => setSettings({ ...settings, autoShowImages: checked })}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Keep messages in Sent/Drafts</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Switch
              checked={settings.keepMessages}
              onCheckedChange={(checked) => setSettings({ ...settings, keepMessages: checked })}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Exclude Spam/Trash from All mail</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Switch
              checked={settings.excludeSpam}
              onCheckedChange={(checked) => setSettings({ ...settings, excludeSpam: checked })}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Confirm link URLs</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Switch
              checked={settings.confirmLinks}
              onCheckedChange={(checked) => setSettings({ ...settings, confirmLinks: checked })}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Conversation grouping</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Switch
              checked={settings.conversationGrouping}
              onCheckedChange={(checked) => setSettings({ ...settings, conversationGrouping: checked })}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Auto-delete unwanted messages</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded">
                AI
              </div>
              <Switch
                checked={settings.autoDeleteUnwanted}
                onCheckedChange={(checked) => setSettings({ ...settings, autoDeleteUnwanted: checked })}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Sticky labels</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Switch
              checked={settings.stickyLabels}
              onCheckedChange={(checked) => setSettings({ ...settings, stickyLabels: checked })}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Auto-unsubscribe</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Select defaultValue="ask">
              <SelectTrigger className="w-[180px] bg-black border-gray-700">
                <SelectValue placeholder="Ask each time" />
              </SelectTrigger>
              <SelectContent className="bg-black border-gray-700">
                <SelectItem value="ask">Ask each time</SelectItem>
                <SelectItem value="always">Always</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <span>Conversations per page</span>
            <Select defaultValue="50">
              <SelectTrigger className="w-[100px] bg-black border-gray-700">
                <SelectValue placeholder="50" />
              </SelectTrigger>
              <SelectContent className="bg-black border-gray-700">
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Composing Section */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Composing</h1>

          <div className="flex items-center justify-between">
            <span>Composer mode</span>
            <Select defaultValue="normal">
              <SelectTrigger className="w-[180px] bg-black border-gray-700">
                <SelectValue placeholder="Normal" />
              </SelectTrigger>
              <SelectContent className="bg-black border-gray-700">
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="rich">Rich Text</SelectItem>
                <SelectItem value="plain">Plain Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <span>Composer text direction</span>
            <Select defaultValue="ltr">
              <SelectTrigger className="w-[180px] bg-black border-gray-700">
                <SelectValue placeholder="Left to Right" />
              </SelectTrigger>
              <SelectContent className="bg-black border-gray-700">
                <SelectItem value="ltr">Left to Right</SelectItem>
                <SelectItem value="rtl">Right to Left</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <span>Composer default font/size</span>
            <div className="flex gap-2">
              <Select defaultValue="arial">
                <SelectTrigger className="w-[120px] bg-black border-gray-700">
                  <SelectValue placeholder="Arial" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  <SelectItem value="arial">Arial</SelectItem>
                  <SelectItem value="times">Times New Roman</SelectItem>
                  <SelectItem value="calibri">Calibri</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="14">
                <SelectTrigger className="w-[70px] bg-black border-gray-700">
                  <SelectValue placeholder="14" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="14">14</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="18">18</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
