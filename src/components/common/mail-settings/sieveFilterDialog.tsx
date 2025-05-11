"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface SieveFilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SieveFilterDialog({ open, onOpenChange }: SieveFilterDialogProps) {
  const [filterName, setFilterName] = useState("")

  // Default Sieve script template
  const defaultScript = `require ["include", "environment", "variables", "relational", "comparator-i;ascii-numeric", "spamtest"];

# Generated: Do not run this script on spam messages
if allof (environment :matches "vnd.proton.spam-threshold" "*",
spamtest :value "ge" :comparator "i;ascii-numeric" "${1}") 
{
  return;
}

`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[#0c0c0e] text-white border-gray-800 p-0 max-w-3xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Add Sieve filter</h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-transparent"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <p className="text-gray-300 mb-6">
            To work properly, each filter must contain at least a name and a valid Sieve script. You can{" "}
            <a href="#" className="text-blue-500 hover:underline">
              learn more about Sieve programming language
            </a>
            .
          </p>

          <div className="mb-4">
            <label htmlFor="filter-name" className="block text-gray-300 mb-2">
              Filter Name
            </label>
            <Input
              id="filter-name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Name"
              className="bg-transparent border-blue-600 text-white focus:border-blue-500 focus:ring-0"
            />
          </div>

          <div className="bg-[#121214] rounded border border-gray-800 mb-6 overflow-hidden">
            <pre className="p-4 text-sm font-mono overflow-auto max-h-[400px]">
              <code>
                <div className="grid grid-cols-[auto,1fr] gap-x-4">
                  <div className="text-gray-500 select-none text-right">
                    {defaultScript.split("\n").map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <div className="text-gray-300">
                    <div>
                      <span className="text-pink-500">require</span>{" "}
                      <span className="text-yellow-500">
                        ["include", "environment", "variables", "relational", "comparator-i;ascii-numeric", "spamtest"]
                      </span>
                      ;
                    </div>
                    <div>&nbsp;</div>
                    <div>
                      <span className="text-gray-500"># Generated: Do not run this script on spam messages</span>
                    </div>
                    <div>
                      <span className="text-pink-500">if</span> allof (environment :matches{" "}
                      <span className="text-yellow-500">"vnd.proton.spam-threshold"</span>{" "}
                      <span className="text-yellow-500">"*"</span>,
                    </div>
                    <div>
                      spamtest :value <span className="text-yellow-500">"ge"</span> :comparator{" "}
                      <span className="text-yellow-500">"i;ascii-numeric"</span>{" "}
                      <span className="text-yellow-500">
                        "${"{"}1{"}"}"
                      </span>
                      )
                    </div>
                    <div>{"{"}</div>
                    <div>&nbsp;&nbsp;return;</div>
                    <div>{"}"}</div>
                    <div>&nbsp;</div>
                    <div>&nbsp;</div>
                    <div>&nbsp;</div>
                  </div>
                </div>
              </code>
            </pre>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button className="bg-gray-700 hover:bg-gray-600 text-white">Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
