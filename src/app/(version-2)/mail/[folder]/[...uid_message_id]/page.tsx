import React, { Suspense } from 'react'
import { MailDisplaySkeleton } from './_components/mail-skeleton'
import serverAxios from '@/lib/api/serverAxios'

import {
  ChevronDown,
  ChevronLeft,
  Forward,
  Lock,
  MoreVertical,
  Reply,
  Star,
  Trash2,
} from "lucide-react";

import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { cn, formatEmail } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMemo, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useRouter } from "next/navigation";
import moment from "moment";
import { ROLE } from "@/lib/types/user.interface";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileAttachmentInterface, MailData } from "@/lib/types/mail.interface";
import { ApiResponse } from '@/lib/types';
import { MailIframe } from '@/components/common/mail-iframe';
import MailDisplay2 from '@/components/common/mail-display2';

const page = async ({ params }: any) => {
  const { folder, uid_message_id } = await params
  const [uid, message_id] = decodeURIComponent(uid_message_id).split('$')

  return (
    <Suspense fallback={<MailDisplaySkeleton />}>
      <MailDisplay folder={folder} uid={uid} message_id={message_id} />
    </Suspense>
  )
}
const MailDisplay = async ({ folder, uid, message_id }: any) => {
  try {
    const { data } = await serverAxios.get<ApiResponse<MailData>>(`/imap/fetch-email-body?folder=${folder}&uid=${uid}&message_id=${message_id}`)
    //   const handleReplyBtnClicked = () => {
    //   if (!replyTextAreaRef.current || !data.result) return;
    //   replyTextAreaRef.current.focus();
    //   if (replyTextAreaRef.current.value.trim().length === 0) {
    //     replyTextAreaRef.current.value = "@" + data.result.from + " ";
    //   }
    // };

    return (
      <div
        className="flex-1 md:flex-none flex flex-col overflow-auto"
        style={{ height: "calc(100dvh - 80px)" }}
      >
        <div className="flex flex-col lg:flex-row justify-between items-start p-4 pl-1 md:p-4 md:pl-1">
          <div className="flex items-start text-sm flex-1 md:gap-2">
            <Button size={"icon"} variant={"ghost"} >
              <ChevronLeft />
            </Button>

            <Avatar className='h-8 w-8 bg-muted-foreground/50 dark:bg-muted/50 hover:rounded-xl rounded-full'>
              <AvatarImage alt={formatEmail(data.result.from.toUpperCase())} />
              <AvatarFallback className='flex items-center justify-center h-8 w-8 bg-muted-foreground/50 dark:bg-muted/50 hover:rounded-xl rounded-full'>
                {data.result?.from && formatEmail(data.result.from)
                  .split(" ")
                  .map((chunk) => chunk[0])
                  .join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col ml-2 md:ml-0">
              <div className="flex flex-col sm:flex-row gap-2 align-text-bottom">
                <div className="font-semibold">{data.result?.from && formatEmail(data.result.from)}</div>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <span className="text-xs text-zinc-500">To me</span>
                <Tooltip>
                  <Popover>
                    <PopoverTrigger asChild>
                      <TooltipTrigger asChild>
                        <Button
                          size={"icon"}
                          variant={"ghost"}
                          className="w-5 h-5"
                        >
                          <ChevronDown size={10} />
                        </Button>
                      </TooltipTrigger>
                    </PopoverTrigger>
                    <PopoverContent className="flex w-[450px] px-4 sm:px-6 md:px-8 lg:px-10">
                      <div className="flex flex-row gap-4 px-2 py-4 text-sm">
                        {/* Left Column */}
                        <div className="flex flex-col items-end text-right shrink-0">
                          <div>from:</div>
                          <div>to:</div>
                          <div>date:</div>
                          <div>subject:</div>
                          <div>mailed-by:</div>
                          <div>security:</div>
                        </div>
                        {/* Right Column */}
                        <div className="flex flex-col">
                          <div>
                            <strong>{data.result.from && formatEmail(data.result.from)}</strong>

                          </div>
                          <div>{data.result?.to}</div>
                          <div>{moment(data.result.timestamp).format("lll")}</div>
                          <div>{data.result.title}</div>
                          <div>{data.result.to}</div>
                          <div className="flex items-center gap-1">
                            <Lock size={10} />
                            Standard encryption (TLS)
                          </div>
                        </div>
                      </div>
                    </PopoverContent>

                  </Popover>
                  <TooltipContent>Show details</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-auto flex justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!data.result}
                // onClick={handleReplyBtnClicked}
                >
                  <Reply className="h-4 w-4" />
                  <span className="sr-only">Reply</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reply</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!data.result}>
                  <Forward className="h-4 w-4" />
                  <span className="sr-only">Forward</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Forward</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!data.result}

                >
                  <Star
                    fill={data.result.isStarred ? "currentColor" : ""}
                    className={cn(
                      "h-4 w-4",
                      data.result.isStarred && "text-yellow-500"
                    )}
                  />
                  <span className="sr-only">
                    {data.result.isStarred ? "Starred" : "Not Starred"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {data.result.isStarred ? "Starred" : "Not Starred"}
              </TooltipContent>
            </Tooltip>

            <AlertDialog>
              <AlertDialogTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" })
                )}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Trash2 className={cn("h-4 w-4")} />
                      <span className="sr-only">Trash</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Add to Trash</TooltipContent>
                </Tooltip>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this mail from your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction

                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!data.result}>
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem >
                  Mark as {data.result.isRead ? "unread" : "read"}
                </DropdownMenuItem>
                <DropdownMenuItem>Star thread</DropdownMenuItem>
                <DropdownMenuItem>Add label</DropdownMenuItem>
                <DropdownMenuItem>Mute thread</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
                <MailDisplay2 
                isMuted
                emailData={{
                  id: data.result.message_id,
                  from: data.result.from,
                  cc:[],
                  bcc:[],
                attachments: [],
                  sender: {
                    name:"Mullayam"
                  },
                  receivedOn:data.result.timestamp,
                  email: data.result.to,
                  subject: data.result.title,
                  decodedBody: data.result.contents! || data.result.shortContent
                }} demo={""} index={1} totalEmails={4} />
        <ScrollArea className="flex-1 flex flex-col overflow-auto border-t border-gray-300 dark:border-gray-800">
          <h2 className="pl-4 text-2xl font-bold mt-4">{data.result.title}</h2>
          {/* {Array.isArray(data.result.hasAttachment) && data.result.hasAttachment.length > 0 && (<FileAttachment attachments={data.result.hasAttachment} messageId={data.result.message_id} />)} */}
          {/* <div className="flex-1 whitespace-pre-wrap py-4 text-sm">

            <MailIframe html={data.result.contents! || data.result.shortContent} senderEmail='mullayam06@airsend.in' />
          </div> */}

          <Separator className="mt-auto" />
          {/* <div className="p-4 ">
            <form>
              <div className="grid gap-4">
                <Textarea
                  ref={replyTextAreaRef}
                  className="p-4"
                  placeholder={`Reply ${data.result.from}...`}
                />
                <div className="flex items-center">
                  <Button
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                    className="ml-auto"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </form>
          </div> */}

        </ScrollArea>
      </div>
    )
  } catch (error) {
    return <MailDisplaySkeleton />
  }
}

export default page