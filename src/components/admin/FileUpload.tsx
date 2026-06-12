import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadToMedia } from "@/lib/storage";

type Props = {
  value?: string | null;
  onChange: (url: string) => void;
  accept?: string;
  folder?: string;
  previewKind?: "image" | "file";
  label?: string;
};

export function FileUpload({
  value,
  onChange,
  accept = "image/*",
  folder = "uploads",
  previewKind = "image",
  label,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (f: File) => {
    setBusy(true);
    try {
      const { url } = await uploadToMedia(f, folder);
      onChange(url);
      toast.success("已上传");
    } catch (e: any) {
      toast.error(e.message || "上传失败");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium">{label}</p>}
      <div className="flex gap-2">
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… 或点击右侧上传"
          className="flex-1"
        />
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])}
        />
        <Button type="button" variant="outline" disabled={busy} onClick={() => ref.current?.click()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange("")}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {value && previewKind === "image" && (
        <img src={value} alt="" className="h-24 w-auto border border-border object-cover" />
      )}
      {value && previewKind === "file" && (
        <a href={value} target="_blank" rel="noreferrer" className="text-xs text-accent underline break-all">
          {value}
        </a>
      )}
    </div>
  );
}
