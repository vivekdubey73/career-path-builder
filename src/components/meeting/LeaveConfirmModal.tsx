import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LeaveConfirmModal({ open, onCancel, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Leave meeting?</DialogTitle>
          <DialogDescription>
            You'll be disconnected from the call and returned to your previous page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onCancel} className="rounded-xl">Stay</Button>
          <Button variant="destructive" onClick={onConfirm} className="rounded-xl">Leave Meeting</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
