"use client";

import { FormEvent, useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ja";
import { Button } from "@/components/ui/button";
import Alert from "@mui/material/Alert";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ActionReturn, calculate } from "./action";

export default function TimeCalculator() {
  const [cleared, setCleared] = useState<boolean>(false);
  const [calculationResult, setCalculationResult] =
    useState<ActionReturn | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(
    dayjs().set("hour", 19).startOf("hour")
  );
  const [endTime, setEndTime] = useState<Dayjs | null>(dayjs());
  const [malePeople, setMalePeople] = useState<string | undefined>(undefined);
  const [femalePeople, setFemalePeople] = useState<string | undefined>(
    undefined
  );
  const [errors, setErrors] = useState<
    { field: string | number; message: string }[] | undefined
  >(undefined);

  const handleCalculate = (e: FormEvent<HTMLFormElement>) => {
    const result = calculate(e);
    setCalculationResult(result);
    if (result.success) {
      setCalculationResult(result);
      setErrors(undefined);
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    } else {
      setErrors(result.errors);
    }
  };

  const handleReset = () => {
    setStartTime(dayjs().set("hour", 19).startOf("hour"));
    setEndTime(dayjs());
    setMalePeople("0");
    setFemalePeople("0");
    setCalculationResult(null);
    setCleared(true);
    // / 3秒後にトーストを非表示にする
    setTimeout(() => {
      setCleared(false);
    }, 3000);
  };

  const isStartTimeDisabled = (time: Dayjs) => {
    const hour = time.hour();
    return hour < 18 && hour > 2;
  };
  const isEndTimeDisabled = (time: Dayjs) => {
    const hour = time.hour();
    return hour < 19 && hour > 3;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
      <form className="flex flex-col gap-8" onSubmit={handleCalculate}>
        <div className="flex gap-4">
          <TimePicker
            name="startTime"
            label="入店時間"
            value={startTime}
            onChange={(newValue) => setStartTime(newValue)}
            ampm={false}
            slotProps={{
              field: { clearable: true },
            }}
            shouldDisableTime={isStartTimeDisabled}
            timeSteps={{ hours: 1, minutes: 1 }}
          />
          <TimePicker
            name="endTime"
            label="退店時間"
            value={endTime}
            onChange={(newValue) => setEndTime(newValue)}
            ampm={false}
            minutesStep={1}
            slotProps={{
              field: { clearable: true },
            }}
            shouldDisableTime={isEndTimeDisabled}
            timeSteps={{ hours: 1, minutes: 1 }}
          />
        </div>
        <div className="flex gap-2">
          <div className="w-full">
            <Label htmlFor="malePeople">男性の人数</Label>
            <Select
              name="malePeople"
              value={malePeople}
              onValueChange={setMalePeople}
            >
              <SelectTrigger className="h-[56px] border-gray-400">
                <SelectValue placeholder="人数" />
              </SelectTrigger>
              <SelectContent side="bottom">
                {[...Array(21)].map((_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i}人
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full">
            <Label htmlFor="femalePeople">女性の人数</Label>
            <Select
              name="femalePeople"
              value={femalePeople}
              onValueChange={setFemalePeople}
            >
              <SelectTrigger className="h-[56px] border-gray-400">
                <SelectValue placeholder="人数" />
              </SelectTrigger>
              <SelectContent side="bottom">
                {[...Array(21)].map((_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i}人
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleReset}>
            クリア
          </Button>
          <Button type="submit">計算する</Button>
        </div>
        {errors && (
          <div>
            {errors.map((error) => (
              <p key={error.field} className="text-red-500">
                {error.message}
              </p>
            ))}
          </div>
        )}
        {calculationResult?.success && calculationResult && (
          <div className="mt-4 p-6 bg-white border rounded-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              計算結果
            </h2>

            <p className="mb-2 text-gray-600">
              <span className="font-semibold">入店・退店時間：</span>
              {calculationResult.input.startTime} 〜{" "}
              {calculationResult.input.endTime}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">滞在時間：</span>
              {calculationResult.calculated.hours}時間{" "}
              {calculationResult.calculated.minutes}分
            </p>
            <p className="mb-2 text-gray-600 text-xs italic">
              ※10分超過していると延長が発生するようになっています
            </p>
            <p className="mb-2 text-gray-600">
              <span className="font-semibold">合計人数：</span>{" "}
              {calculationResult.calculated.totalPeople}人
            </p>
            <p className="mb-4 text-gray-600">
              <span className="font-semibold">合計滞在時間：</span>
              {calculationResult.calculated.totalHours}時間{" "}
              {calculationResult.calculated.totalMinutes}分
            </p>

            <div className="border-t my-4"></div>

            <h3 className="text-md font-semibold mb-2 text-gray-700">男性</h3>
            <p className="mb-1 text-gray-600">
              セット料:
              <span className="text-purple-600 font-bold ml-1">
                {calculationResult.calculated.maleStay.firstHourCount}
              </span>
            </p>
            <p className="mb-4 text-gray-600">
              セット料(延長):
              <span className="text-purple-600 font-bold ml-1">
                {calculationResult.calculated.maleStay.extensionCount}
              </span>
            </p>

            <h3 className="text-md font-semibold mb-2 text-gray-700">女性</h3>
            <p className="mb-1 text-gray-600">
              セット料-F:
              <span className="text-purple-600 font-bold ml-1">
                {calculationResult.calculated.femaleStay.firstHourCount}
              </span>
            </p>
            <p className="text-gray-600">
              セット料-F(延長):
              <span className="text-purple-600 font-bold ml-1">
                {calculationResult.calculated.femaleStay.extensionCount}
              </span>
            </p>
            <p className="mt-6 p-2 text-center text-sm text-purple-700 bg-purple-100 rounded-md">
              <strong>注:</strong> 紫の数字をレジに入力してください
            </p>
          </div>
        )}
        {cleared && (
          <Alert
            sx={{ position: "absolute", bottom: 10, right: 10 }}
            severity="success"
          >
            クリアしました
          </Alert>
        )}
      </form>
    </LocalizationProvider>
  );
}
