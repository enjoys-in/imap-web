import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function EmailSettings() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-12">Messages and composing</h1>

        {/* General Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">General</h2>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span>Daily email notifications</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Receive a daily summary of your messages</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch />
          </div>
          <Link href="#" className="text-blue-500 text-sm">
            Set email address
          </Link>
        </section>

        {/* Layout Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Layout</h2>

          {/* Inbox Layout */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span>Inbox</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Choose how your inbox is displayed</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <LayoutOption id="column" name="inbox" label="Column" imageSrc="/email-inbox-layout.png" />
              <LayoutOption id="row" name="inbox" label="Row" imageSrc="/email-inbox-row.png" selected />
            </div>
          </div>

          {/* Composer Layout */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span>Composer</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Choose how your composer is displayed</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <LayoutOption id="normal" name="composer" label="Normal" imageSrc="/email-composer-normal.png" />
              <LayoutOption id="maximized" name="composer" label="Maximized" imageSrc="/maximized-email-composer.png" />
            </div>
          </div>
        </section>

        {/* Density Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold">Density</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-blue-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Choose the spacing between elements</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <LayoutOption
              id="comfortable"
              name="density"
              label="Comfortable"
              imageSrc="/comfortable-email-density.png"
              selected
            />
            <LayoutOption
              id="compact"
              name="density"
              label="Compact"
              imageSrc="/placeholder.svg?height=150&width=150&query=email compact density"
            />
          </div>
        </section>
      </div>
    </div>
  )
}

interface LayoutOptionProps {
  id: string
  name: string
  label: string
  imageSrc: string
  selected?: boolean
}

function LayoutOption({ id, name, label, imageSrc, selected }: LayoutOptionProps) {
  return (
    <div className={`relative rounded-md overflow-hidden border ${selected ? "border-blue-500" : "border-gray-700"}`}>
      <input type="radio" id={id} name={name} className="sr-only" defaultChecked={selected} />
      <label htmlFor={id} className="cursor-pointer block">
        <div className="bg-gray-800 aspect-square relative">
          <Image src={imageSrc || "/placeholder.svg"} alt={`${label} layout`} fill className="object-contain p-2" />
        </div>
        <div className="text-center py-2 bg-gray-900">{label}</div>
      </label>
    </div>
  )
}
