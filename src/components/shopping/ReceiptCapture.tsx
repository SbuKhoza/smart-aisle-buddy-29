import { useRef, useState } from "react";
import { Camera, Loader2, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { uploadReceiptImage } from "@/lib/firebase-storage";

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // keep in sync with storage.rules

export function ReceiptCapture({
  uid,
  tripId,
  receiptURL,
  onSaved,
}: {
  uid: string;
  tripId: string;
  receiptURL?: string | null;
  onSaved: (url: string) => void | Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image of your receipt");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("That photo is too large — try a smaller image");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);
    try {
      const url = await uploadReceiptImage(file, uid, tripId);
      await onSaved(url);
      toast.success("Receipt saved");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save the receipt — try again");
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
      setPreview(null);
    }
  }

  const displayURL = preview ?? receiptURL ?? null;

  return (
    <Card className="rounded-2xl border-border p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Receipt size={13} /> Receipt
        </p>
        {displayURL && !uploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs font-medium text-primary hover:underline"
          >
            Retake
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      {displayURL ? (
        <div className="relative overflow-hidden rounded-xl border border-border">
          <img
            src={displayURL}
            alt="Shopping receipt"
            className="max-h-72 w-full object-contain bg-muted/40"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 size={20} className="animate-spin text-primary" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-28 w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-accent/40 text-muted-foreground active:bg-accent"
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-primary" />
          ) : (
            <>
              <Camera size={20} />
              <span className="text-xs font-medium">Take a photo of your receipt</span>
            </>
          )}
        </button>
      )}
    </Card>
  );
}