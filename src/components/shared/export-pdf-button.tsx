"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  generateWeeklyPdf,
  generateMonthlyPdf,
  type WeeklyPdfData,
  type MonthlyPdfData,
} from "@/lib/pdf-export";

type ExportProps =
  | {
      type: "weekly";
      data: WeeklyPdfData;
      filename: string;
    }
  | {
      type: "monthly";
      data: MonthlyPdfData;
      filename: string;
    };

export function ExportPdfButton(props: ExportProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      if (props.type === "weekly") {
        const doc = generateWeeklyPdf(props.data);
        doc.save(`${props.filename}.pdf`);
      } else {
        const doc = generateMonthlyPdf(props.data);
        doc.save(`${props.filename}.pdf`);
      }
      toast.success("Laporan PDF berhasil diunduh.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengunduh PDF";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className="gap-1.5"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <FileDown className="size-4" />
      )}
      <span>Export PDF</span>
    </Button>
  );
}
