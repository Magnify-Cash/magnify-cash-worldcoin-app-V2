
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TestInputModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TestInputModal({ isOpen, onClose }: TestInputModalProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [isInputReady, setIsInputReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      setInputValue("");
      setIsInputReady(false);
      
      // Delay enabling the input to prevent keyboard pop-up on mobile
      const timer = setTimeout(() => {
        setIsInputReady(true);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Test Input</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="testInput" className="text-sm font-medium">
              Test Input
            </label>
            <Input
              id="testInput"
              placeholder="Type something..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              readOnly={!isInputReady}
              ref={inputRef}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full py-6">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
