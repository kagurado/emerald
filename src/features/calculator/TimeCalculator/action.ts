import { FormEvent } from "react";
import { formSchema } from "./schema";

// 延長とみなさない最初の9分
const NO_EXTENSION_MINUTES = 9;

export interface ActionReturn {
  input: {
    startTime: string;
    endTime: string;
    malePeople: number;
    femalePeople: number;
  };
  calculated: {
    hours: number;
    minutes: number;
    totalPeople: number;
    totalHours: number;
    totalMinutes: number;
    totalExtensions: number;
    maleStay: {
      firstHourCount: number;
      extensionCount: number;
    };
    femaleStay: {
      firstHourCount: number;
      extensionCount: number;
    };
  };
  success: boolean;
  errors?: { field: string | number; message: string }[];
}

export function calculate(e: FormEvent<HTMLFormElement>): ActionReturn {
  e.preventDefault();
  const form = e.currentTarget as HTMLFormElement;
  const formData = new FormData(form);

  const startTimeStr = formData.get("startTime") as string;
  const endTimeStr = formData.get("endTime") as string;

  const malePeopleStr = formData.get("malePeople");
  const femalePeopleStr = formData.get("femalePeople");

  const parsedMalePeople = malePeopleStr
    ? parseInt(malePeopleStr as string, 10)
    : 0;
  const parsedFemalePeople = femalePeopleStr
    ? parseInt(femalePeopleStr as string, 10)
    : 0;

  const input = {
    startTime: startTimeStr,
    endTime: endTimeStr,
    malePeople: parsedMalePeople,
    femalePeople: parsedFemalePeople,
  };
  const validationResult = formSchema.safeParse(input);
  if (!validationResult.success) {
    // バリデーションエラーの処理
    return {
      input,
      calculated: {
        hours: 0,
        minutes: 0,
        totalPeople: 0,
        totalHours: 0,
        totalMinutes: 0,
        totalExtensions: 0,
        maleStay: {
          firstHourCount: 0,
          extensionCount: 0,
        },
        femaleStay: {
          firstHourCount: 0,
          extensionCount: 0,
        },
      },
      success: false,
      errors: validationResult.error.errors.map((err) => ({
        field: err.path[0],
        message: err.message,
      })),
    };
  }

  const totalPeople = parsedMalePeople + parsedFemalePeople;

  const now = new Date();
  const parsedStartTime = new Date(
    `${now.toISOString().split("T")[0]}T${startTimeStr}:00`
  );
  let parsedEndTime = new Date(
    `${now.toISOString().split("T")[0]}T${endTimeStr}:00`
  );

  if (parsedEndTime < parsedStartTime) {
    parsedEndTime.setDate(parsedEndTime.getDate() + 1);
  }

  const timeDifference = Math.floor(
    (parsedEndTime.getTime() - parsedStartTime.getTime()) / (1000 * 60)
  );

  const hours = Math.floor(timeDifference / 60);
  const minutes = timeDifference % 60;

  // 延長の判断：1時間を超えた場合、最初の9分を延長とみなさない
  let extensions = 0;
  if (timeDifference > 60) {
    const excessMinutes = timeDifference - 60; // 1時間を超えた分のみ対象
    if (excessMinutes > NO_EXTENSION_MINUTES) {
      extensions = Math.ceil((excessMinutes - NO_EXTENSION_MINUTES) / 30);
    }
  }

  const totalPeopleTime = timeDifference * totalPeople;
  const totalHours = Math.floor(totalPeopleTime / 60);
  const totalMinutes = totalPeopleTime % 60;

  const convertToJSTFormattedString = (date: Date) => {
    const jstDate = new Date(date.getTime());
    const month = (jstDate.getMonth() + 1).toString().padStart(2, "0");
    const day = jstDate.getDate().toString().padStart(2, "0");
    const hours = jstDate.getHours().toString().padStart(2, "0");
    const minutes = jstDate.getMinutes().toString().padStart(2, "0");
    return `${month}/${day}/${hours}:${minutes}`;
  };

  // 男性の滞在時間内訳計算
  const maleFirstHourCount = parsedMalePeople > 0 ? parsedMalePeople : 0;
  const maleExtensionCount =
    parsedMalePeople > 0 && timeDifference > 60
      ? Math.ceil(
          Math.max(0, timeDifference - 60 - NO_EXTENSION_MINUTES) / 30
        ) * parsedMalePeople
      : 0;

  // 女性の滞在時間内訳計算
  const femaleFirstHourCount = parsedFemalePeople > 0 ? parsedFemalePeople : 0;
  const femaleExtensionCount =
    parsedFemalePeople > 0 && timeDifference > 60
      ? Math.ceil(
          Math.max(0, timeDifference - 60 - NO_EXTENSION_MINUTES) / 30
        ) * parsedFemalePeople
      : 0;

  return {
    input: {
      startTime: convertToJSTFormattedString(parsedStartTime),
      endTime: convertToJSTFormattedString(parsedEndTime),
      malePeople: parsedMalePeople,
      femalePeople: parsedFemalePeople,
    },
    calculated: {
      hours,
      minutes,
      totalHours,
      totalMinutes,
      totalPeople,
      totalExtensions: extensions,
      maleStay: {
        firstHourCount: maleFirstHourCount,
        extensionCount: maleExtensionCount,
      },
      femaleStay: {
        firstHourCount: femaleFirstHourCount,
        extensionCount: femaleExtensionCount,
      },
    },
    success: true,
  };
}
