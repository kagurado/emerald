"use client";

import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Button } from "@/components/ui/button";
import TimeCalculatorForm from "./form";
import CustomTimeCalculatorForm from "./customForm";

type Mode = "simple" | "custom";

export default function TimeCalculator() {
  const [mode, setMode] = useState<Mode>("simple");

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
      <div className="flex flex-col gap-6">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === "simple" ? "default" : "outline"}
            onClick={() => setMode("simple")}
            className={mode === "simple" ? undefined : "bg-white"}
          >
            シンプル
          </Button>
          <Button
            type="button"
            variant={mode === "custom" ? "default" : "outline"}
            onClick={() => setMode("custom")}
            className={mode === "custom" ? undefined : "bg-white"}
          >
            時間差来店・退店
          </Button>
        </div>
        {mode === "simple" ? (
          <TimeCalculatorForm />
        ) : (
          <CustomTimeCalculatorForm />
        )}
      </div>
    </LocalizationProvider>
  );
}
