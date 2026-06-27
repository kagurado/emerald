"use client";

import { FormEvent, useEffect, useState } from "react";
import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ja";
import { Button } from "@/components/ui/button";
import Alert from "@mui/material/Alert";
import { Clock, Plus, Trash2 } from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  calculate,
  CustomActionReturn,
  GroupInput,
  NO_EXTENSION_MINUTES,
} from "./customAction";
import GradientCircularProgress from "@/components/ui/progress";

interface GroupState {
  id: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  malePeople: string;
  femalePeople: string;
}

const createGroup = (startTime: Dayjs, endTime: Dayjs): GroupState => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2),
  startTime,
  endTime,
  malePeople: "0",
  femalePeople: "0",
});

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <p className="mb-1 text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-purple-600">{value}</p>
    </div>
  );
}

export default function CustomTimeCalculatorForm() {
  const [loading, setLoading] = useState(true);
  const [cleared, setCleared] = useState<boolean>(false);
  const [calculationResult, setCalculationResult] =
    useState<CustomActionReturn | null>(null);
  const [groups, setGroups] = useState<GroupState[]>([]);
  const [errors, setErrors] = useState<
    { groupIndex?: number; field: string | number; message: string }[]
  >([]);

  useEffect(() => {
    const initialStartTime = dayjs().set("hour", 19).startOf("hour");
    const initialEndTime = dayjs();
    setGroups([createGroup(initialStartTime, initialEndTime)]);
    setLoading(false);
  }, []);

  const updateGroup = (id: string, patch: Partial<GroupState>) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    );
  };

  const handleAddGroup = () => {
    setGroups((prev) => {
      const last = prev[prev.length - 1];
      const baseStart =
        last?.startTime ?? dayjs().set("hour", 19).startOf("hour");
      const baseEnd = last?.endTime ?? dayjs();
      return [...prev, createGroup(baseStart, baseEnd)];
    });
  };

  const handleRemoveGroup = (id: string) => {
    setGroups((prev) =>
      prev.length > 1 ? prev.filter((g) => g.id !== id) : prev,
    );
  };

  const handleCalculate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const groupInputs: GroupInput[] = groups.map((g) => ({
      startTime: g.startTime ? g.startTime.format("HH:mm") : "",
      endTime: g.endTime ? g.endTime.format("HH:mm") : "",
      malePeople: g.malePeople ? parseInt(g.malePeople, 10) : 0,
      femalePeople: g.femalePeople ? parseInt(g.femalePeople, 10) : 0,
    }));

    const result = calculate(groupInputs);
    setCalculationResult(result);
    if (result.success) {
      setErrors([]);
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    } else {
      setErrors(result.errors ?? []);
    }
  };

  const handleReset = () => {
    const initialStartTime = dayjs().set("hour", 19).startOf("hour");
    const initialEndTime = dayjs();
    setGroups([createGroup(initialStartTime, initialEndTime)]);
    setCalculationResult(null);
    setErrors([]);
    setCleared(true);
    setTimeout(() => {
      setCleared(false);
    }, 3000);
  };

  const isStartTimeDisabled = (time: Dayjs) => {
    const hour = time.hour();
    return hour < 18 && hour > 4;
  };
  const isEndTimeDisabled = (time: Dayjs) => {
    const hour = time.hour();
    return hour < 19 && hour > 6;
  };

  if (loading) {
    return <GradientCircularProgress />;
  }

  return (
    <form className="flex flex-col gap-8" onSubmit={handleCalculate}>
      <div className="flex flex-col gap-6">
        {groups.map((group, index) => {
          const groupErrors = errors.filter((e) => e.groupIndex === index);
          return (
            <div
              key={group.id}
              className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">
                  グループ {index + 1}
                </span>
                {groups.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveGroup(group.id)}
                    className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    削除
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                <DesktopTimePicker
                  label="入店時間"
                  value={group.startTime}
                  onChange={(newValue) =>
                    updateGroup(group.id, { startTime: newValue })
                  }
                  ampm={false}
                  slots={{ openPickerIcon: Clock }}
                  slotProps={{
                    field: { clearable: true },
                  }}
                  shouldDisableTime={isStartTimeDisabled}
                  timeSteps={{ hours: 1, minutes: 1 }}
                />
                <DesktopTimePicker
                  label="退店時間"
                  value={group.endTime}
                  onChange={(newValue) =>
                    updateGroup(group.id, { endTime: newValue })
                  }
                  ampm={false}
                  minutesStep={1}
                  slots={{ openPickerIcon: Clock }}
                  slotProps={{
                    field: { clearable: true },
                  }}
                  shouldDisableTime={isEndTimeDisabled}
                  timeSteps={{ hours: 1, minutes: 1 }}
                />
              </div>
              <div className="flex gap-2">
                <div className="w-full flex flex-col gap-1">
                  <Label className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                    男性の人数
                  </Label>
                  <Select
                    value={group.malePeople}
                    onValueChange={(value) =>
                      updateGroup(group.id, { malePeople: value })
                    }
                  >
                    <SelectTrigger className="h-[56px] rounded-lg border-gray-300">
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
                <div className="w-full flex flex-col gap-1">
                  <Label className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-pink-500" />
                    女性の人数
                  </Label>
                  <Select
                    value={group.femalePeople}
                    onValueChange={(value) =>
                      updateGroup(group.id, { femalePeople: value })
                    }
                  >
                    <SelectTrigger className="h-[56px] rounded-lg border-gray-300">
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
              {groupErrors.length > 0 && (
                <div>
                  {groupErrors.map((error, i) => (
                    <p key={i} className="text-red-500 text-sm">
                      {error.message}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAddGroup}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-sm bg-white border border-gray-200 text-sm font-medium text-gray-600"
      >
        <Plus className="h-4 w-4" />
        グループを追加
      </button>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="bg-white"
        >
          クリア
        </Button>
        <Button type="submit">計算する</Button>
      </div>

      {errors.filter((e) => e.groupIndex === undefined).length > 0 && (
        <div>
          {errors
            .filter((e) => e.groupIndex === undefined)
            .map((error, i) => (
              <p key={i} className="text-red-500">
                {error.message}
              </p>
            ))}
        </div>
      )}

      {calculationResult?.success && (
        <div className="mt-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold mb-5 text-purple-700">
            レジに入力する数字
          </h2>

          <div className="mb-2 flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
            <span className="font-medium text-gray-700">男性</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatBox
              label="セット料"
              value={calculationResult.total.maleStay.firstHourCount}
            />
            <StatBox
              label="セット料（延長）"
              value={calculationResult.total.maleStay.extensionCount}
            />
          </div>

          <div className="mt-5 mb-2 flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-pink-500" />
            <span className="font-medium text-gray-700">女性</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatBox
              label="セット料-F"
              value={calculationResult.total.femaleStay.firstHourCount}
            />
            <StatBox
              label="セット料-F（延長）"
              value={calculationResult.total.femaleStay.extensionCount}
            />
          </div>

          <div className="border-t border-gray-200 my-5" />

          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-gray-600">
            <span>
              合計人数{" "}
              <span className="font-bold text-gray-900">
                {calculationResult.total.totalPeople}人
              </span>
            </span>
            <span>
              合計滞在時間{" "}
              <span className="font-bold text-gray-900">
                {calculationResult.total.totalHours}時間
                {calculationResult.total.totalMinutes}分
              </span>
            </span>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-sm text-gray-500">
              グループ別の内訳（検算用）
            </p>
            <div className="flex flex-col gap-3">
              {calculationResult.groups.map((group, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="text-base font-bold text-gray-900">
                      グループ {index + 1}
                    </span>
                    <span className="text-sm text-gray-500">
                      {group.input.startTime} 〜 {group.input.endTime}
                      <span className="ml-3">
                        滞在 {group.hours}時間{group.minutes}分
                      </span>
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                      男 {group.input.malePeople}人 ・ セット
                      {group.maleStay.firstHourCount} / 延長
                      {group.maleStay.extensionCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-pink-500" />
                      女 {group.input.femalePeople}人 ・ F
                      {group.femaleStay.firstHourCount} / 延長
                      {group.femaleStay.extensionCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-5 text-xs text-gray-400">
            {`※ ${NO_EXTENSION_MINUTES}分を超えて超過すると延長が発生します（セット60分・延長30分単位）`}
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
  );
}
