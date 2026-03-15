import { useRef } from "react";
import { Upload, Download, RotateCcw } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

interface ToolbarProps {
  title: string;
  onRefresh?: () => void;
}

export default function Toolbar({ title, onRefresh }: ToolbarProps) {
  const { addToast } = useApp();
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <div className="flex gap-1">
        <input
          ref={ref}
          type="file"
          hidden
          accept=".csv,.pdf,.jpg,.png,.xlsx,.txt"
          onChange={(e) => {
            if (e.target.files?.[0]) addToast(`Uploaded: ${e.target.files[0].name}`);
            e.target.value = "";
          }}
        />
        <button onClick={() => ref.current?.click()} className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Upload">
          <Upload size={14} />
        </button>
        <button onClick={() => addToast("Download started")} className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Download">
          <Download size={14} />
        </button>
        <button
          onClick={() => { onRefresh?.(); addToast("Memory refreshed"); }}
          className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Refresh Memory"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}
