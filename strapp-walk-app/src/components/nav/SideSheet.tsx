import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Megaphone,
  FileText,
  ScrollText,
  Download,
  KeyRound,
  Settings as SettingsIcon,
  SlidersHorizontal,
} from "lucide-react";
import { useStrapp } from "@/lib/strapp/store";

const items = [
  { to: "/outreach", label: "Outreach Hub", icon: Megaphone, desc: "Generate cold messages" },
  { to: "/templates", label: "Templates", icon: FileText, desc: "Saved message templates" },
  { to: "/contracts", label: "Contracts", icon: ScrollText, desc: "Generate client contracts" },
] as const;

const systemItems = [
  { to: "/settings", label: "API Keys", icon: KeyRound, desc: "Google Maps & service keys" },
  { to: "/settings", label: "Settings", icon: SettingsIcon, desc: "Revenue goal, operator" },
  { to: "/settings", label: "System Preferences", icon: SlidersHorizontal, desc: "App behaviour" },
] as const;

export function SideSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { exportJson } = useStrapp();

  const exportData = () => {
    try {
      const blob = new Blob([exportJson()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `strapp-walk-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed");
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-[88%] max-w-[360px] border-l border-border bg-panel p-0"
      >
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground">
            MORE
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100dvh-64px)]">
          <Section title="Data">
            <button
              onClick={() => {
                exportData();
                onClose();
              }}
              className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-panel-elevated transition-colors"
            >
              <Download className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm text-foreground">Export Data</div>
                <div className="text-xs text-muted-foreground">Download a JSON backup</div>
              </div>
            </button>
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <div className="px-5 pt-3 pb-1 font-mono text-[10px] tracking-[0.25em] text-muted-foreground/70">
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({
  to,
  label,
  desc,
  icon: Icon,
  onClose,
}: {
  to: string;
  label: string;
  desc: string;
  icon: any;
  onClose: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClose}
      className="flex items-center gap-3 px-5 py-3 hover:bg-panel-elevated transition-colors"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <div className="text-sm text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </Link>
  );
}
