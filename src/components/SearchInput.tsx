"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Search, X } from "lucide-react";
import { Input } from "./ui/input";
 
function SearchInput() {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const searchBarRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   
  // debounce searching
  useEffect(() => {
    timerRef.current = setTimeout(() => {
    
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchText]);
  return (
    <>
      <div className="hidden md:flex">
        <form className="h-full flex-1">
          <div className="relative h-10">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Search..."
              className="pl-9 h-10 rounded-xl glass-input border-0 bg-secondary/40 placeholder:text-muted-foreground/50 max-w-[700px] focus-visible:ring-1 focus-visible:ring-primary/30 smooth-transition"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
            />
            {searchText !== "" && (
              <Button
                className="absolute right-1 top-1 h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive smooth-transition"
                size={"icon"}
                variant={"ghost"}
                onClick={(e) => {
                  e.preventDefault();
                  setSearchText("");
              
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
      <div className="flex flex-1 justify-end md:hidden">
        <form className={cn("h-full flex w-full", !showSearchBar && "hidden")}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Search..."
              ref={searchBarRef}
              className="pl-9 h-10 rounded-xl glass-input border-0 bg-secondary/40 placeholder:text-muted-foreground/50 max-w-[700px] focus-visible:ring-1 focus-visible:ring-primary/30 smooth-transition"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
            />
            <Button
              className="absolute right-1 top-1 h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive smooth-transition"
              size={"icon"}
              variant={"ghost"}
              onClick={(e) => {
                e.preventDefault();
                setSearchText("");
                setShowSearchBar(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
        <Button
          variant={"ghost"}
          className={cn("p-2 flex rounded-xl hover:bg-primary/10 hover:text-primary smooth-transition", showSearchBar && "hidden")}
          onClick={() => {
            setShowSearchBar(true);
            setTimeout(() => {
              searchBarRef.current?.focus();
            }, 0);
          }}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

export default SearchInput;
