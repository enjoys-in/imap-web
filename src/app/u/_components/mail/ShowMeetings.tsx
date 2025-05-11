import React from 'react'

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
  import { ExpandableCard } from "../ExpandableCard"
import { Separator } from '@radix-ui/react-select'
const ShowMeetings = () => {
  return (
    <Accordion type="single"
    collapsible
    className="w-full">
    <AccordionItem value="item-1" className="border-none ">
      <AccordionTrigger className="hover:no-underline w-full py-1">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium">Upcoming meetings</h3>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <Separator />
        <ExpandableCard />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
  )
}

export default ShowMeetings