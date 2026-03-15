import { useApp } from "@/contexts/AppContext";

export default function ToastContainer() {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-card border border-border rounded-lg px-4 py-2.5 text-xs text-foreground shadow-lg min-w-[220px] animate-fade-in"
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
