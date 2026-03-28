import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { InputTags } from "@/components/input-tags";
import { SendMail } from "./server-actions/send-mail";
import { useToast } from "./ui/use-toast";
import { CustomMailOptions } from "@/lib/types/mail.interface";
import { RichTextEditor } from "./editor";
import { useEditor } from "@/hooks/useEditor";
 
export function ComposeEmailDrawerSheet({ children }: { children: ReactNode }) {
  const [open, setOpen] = React.useState(false);
  
  const [mailOptions, setMailOptions] = useState<Partial<CustomMailOptions & { is_scheduled: boolean, scheduled_time: string }>>({
    to: [],
    from: "",
    cc: [],
    bcc: [],
    subject: "",
    html: ``,
    attachments: [],
    is_scheduled: false,
    scheduled_time: "",
  })

  const { toast } = useToast();
  const { html, attachments } = useEditor()
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const sendMail = async () => {
    if (mailOptions.to?.length === 0) {
      toast({ title: "Please Enter Recipients", description: "Press Enter to Add Recipients" })
      return
    }
    toast({ title: "Sending Mail", })
    try {
      const data = await SendMail({ ...mailOptions, html, attachments });
      if (!data.success) {
        throw new Error(data.message)
      }
      toast({
        title: "Success",
        description: "Email Sent",
      })
      setOpen(false)

    } catch (error: any) {
        
      toast({
        title: "Error while sending mail",
        description: error.message,
      })
      setOpen(false)
    }
  }
  const handleInputChange = (key: string, value: any) => {
    setMailOptions({ ...mailOptions, [key]: value })
  }
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      // sendMail(mailOptions);
    }
  }
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="w-full">{children}</DialogTrigger>
        <DialogContent className="w-[1200px] min-w-[1000px] max-h-[900px] flex flex-col glass-card rounded-2xl border-0 shadow-elevated-lg animate-scale-in">
          <DialogHeader className="flex flex-col flex-1">
            <DialogTitle className="mb-6 text-xl font-semibold gradient-text">New Message</DialogTitle>
            <Content value={mailOptions} handleInputChange={handleInputChange} />
          </DialogHeader>
          <DialogFooter>
            <SendButton onClick={sendMail} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="p-4 min-h-[85dvh] flex flex-col glass-card rounded-t-3xl border-0">
        <DrawerTitle className="mb-5 text-xl font-semibold gradient-text">New Message</DrawerTitle>
        <Content value={mailOptions} handleInputChange={handleInputChange} />
        <DrawerFooter className="flex flex-row justify-end">
          <SendButton onClick={sendMail} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
const SendButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button className="w-40 h-10 rounded-xl bg-primary text-primary-foreground font-semibold shadow-glow hover:shadow-glow-lg smooth-transition hover-lift shine-effect" onClick={onClick}>
      Send
    </Button>
  );
}
const Content = ({ value, handleInputChange }: { value: any, handleInputChange: any }) => {
  const [emails, setEmails] = useState<string[]>([]);
  useEffect(() => {
    handleInputChange("to", emails)
  }, [emails])
  return (
    <form className="flex-1 flex flex-col gap-3">
      <div className="flex flex-row gap-4 items-center w-full">
        <InputTags id="to-mail" value={emails} onChange={setEmails} />
      </div>
      <div className="w-full">
        <Input id="subject" value={value.subject} placeholder="Subject" className="h-11 rounded-xl glass-input border-0 bg-secondary/40 px-4 text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/30"
          onChange={(e) => handleInputChange("subject", e.target.value)} />
      </div>
      <div className="flex-1 flex max-h-[600px] overflow-y-auto rounded-xl glass-input border-0 bg-secondary/30 focus:!ring-transparent">
        <RichTextEditor />
      </div>
    </form>
  );
};
