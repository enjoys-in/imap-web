"use client"

import { useState } from "react"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  Code,
  Link2,
  ImageIcon,
  FileText,
  Info,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfileSettings() {
  const [displayName, setDisplayName] = useState("Mullayam")
  const [footerEnabled, setFooterEnabled] = useState(true)
  const [secureEmailEnabled, setSecureEmailEnabled] = useState(true)

  return (
    <div className="min-h-screen bg-black text-white p-8 flex justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Display name and signature</h1>

        <div className="space-y-6">
          {/* Email Address */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="w-40 text-sm font-medium">Email address</label>
            <div className="flex-1">
              <Select defaultValue="enjoyso6@protonmail.com">
                <SelectTrigger className="w-full bg-black border-gray-700 text-white">
                  <SelectValue placeholder="Select email" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 text-white">
                  <SelectItem value="enjoyso6@protonmail.com">enjoyso6@protonmail.com</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Display Name */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label htmlFor="display-name" className="w-40 text-sm font-medium">
              Display name
            </label>
            <div className="flex-1">
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Signature */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-40 flex items-start gap-2">
              <label className="text-sm font-medium">Signature</label>
              <Info className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="border border-gray-700 rounded-md overflow-hidden">
                <div className="h-32 bg-white w-full p-2"></div>
                <div className="bg-black border-t border-gray-700 p-1 flex items-center gap-1 overflow-x-auto">
                  <select className="bg-black border border-gray-700 rounded px-2 py-1 text-xs">
                    <option>Arial</option>
                  </select>
                  <select className="bg-black border border-gray-700 rounded px-2 py-1 text-xs">
                    <option>14px</option>
                  </select>
                  <div className="h-4 border-r border-gray-700 mx-1"></div>
                  <button className="p-1 hover:bg-gray-800 rounded">
                    <Bold className="h-4 w-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-800 rounded">
                    <Italic className="h-4 w-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-800 rounded">
                    <Underline className="h-4 w-4" />
                  </button>
                  <div className="h-4 border-r border-gray-700 mx-1"></div>
                  <button className="p-1 hover:bg-gray-800 rounded">
                    <List className="h-4 w-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-800 rounded">
                    <ListOrdered className="h-4 w-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-800 rounded">
                    <AlignLeft className="h-4 w-4" />
                  </button>
                  <div className="h-4 border-r border-gray-700 mx-1"></div>
                  <button className="p-1 hover:bg-gray-800 rounded">
                    <Code className="h-4 w-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-800 rounded">
                    <Link2 className="h-4 w-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-800 rounded">
                    <ImageIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-800 rounded">
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Update</Button>
            </div>
          </div>

          {/* Proton Mail Footer */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4">
            <div className="w-40 flex items-center gap-2">
              <label className="text-sm font-medium">Proton Mail footer</label>
              <Info className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex-1 flex items-center gap-2">
              <Switch
                checked={footerEnabled}
                onCheckedChange={setFooterEnabled}
                className="data-[state=checked]:bg-blue-600"
              />
              <div className="flex items-center gap-1">
                <span className="text-blue-500 font-medium">Proton Mail</span>
              </div>
            </div>
          </div>

          {/* Sent with Proton Mail */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-40"></div>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-sm text-gray-400">Sent with</span>
              <span className="text-blue-500 font-medium">Proton Mail</span>
              <span className="text-sm text-gray-400">secure email.</span>
              <Switch
                checked={secureEmailEnabled}
                onCheckedChange={setSecureEmailEnabled}
                className="data-[state=checked]:bg-blue-600 ml-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
