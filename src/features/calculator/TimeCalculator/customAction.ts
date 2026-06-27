import { customFormSchema } from "./customSchema";

// 延長とみなさない最初の5分
export const NO_EXTENSION_MINUTES = 5;

export interface GroupInput {
  startTime: string;
  endTime: string;
  malePeople: number;
  femalePeople: number;
}

interface StayBreakdown {
  firstHourCount: number;
  extensionCount: number;
}

export interface GroupResult {
  input: {
    startTime: string;
    endTime: string;
    malePeople: number;
    femalePeople: number;
  };
  hours: number;
  minutes: number;
  extensionUnits: number;
  maleStay: StayBreakdown;
  femaleStay: StayBreakdown;
}

export interface CustomActionReturn {
  groups: GroupResult[];
  total: {
    totalPeople: number;
    totalHours: number;
    totalMinutes: number;
    maleStay: StayBreakdown;
    femaleStay: StayBreakdown;
  };
  success: boolean;
  errors?: { groupIndex?: number; field: string | number; message: string }[];
}

const convertToJSTFormattedString = (date: Date) => {
  const jstDate = new Date(date.getTime());
  const month = (jstDate.getMonth() + 1).toString().padStart(2, "0");
  const day = jstDate.getDate().toString().padStart(2, "0");
  const hours = jstDate.getHours().toString().padStart(2, "0");
  const minutes = jstDate.getMinutes().toString().padStart(2, "0");
  return `${month}/${day}/${hours}:${minutes}`;
};

function calculateGroup(group: GroupInput): GroupResult {
  const { startTime, endTime, malePeople, femalePeople } = group;

  const now = new Date();
  const parsedStartTime = new Date(
    `${now.toISOString().split("T")[0]}T${startTime}:00`,
  );
  const parsedEndTime = new Date(
    `${now.toISOString().split("T")[0]}T${endTime}:00`,
  );

  if (parsedEndTime < parsedStartTime) {
    parsedEndTime.setDate(parsedEndTime.getDate() + 1);
  }

  const timeDifference = Math.floor(
    (parsedEndTime.getTime() - parsedStartTime.getTime()) / (1000 * 60),
  );

  const hours = Math.floor(timeDifference / 60);
  const minutes = timeDifference % 60;

  // 延長の判断：1時間を超えた場合、最初の5分を延長とみなさない
  let extensionUnits = 0;
  if (timeDifference > 60) {
    const excessMinutes = timeDifference - 60;
    if (excessMinutes > NO_EXTENSION_MINUTES) {
      extensionUnits = Math.ceil((excessMinutes - NO_EXTENSION_MINUTES) / 30);
    }
  }

  const maleFirstHourCount = malePeople > 0 ? malePeople : 0;
  const maleExtensionCount = malePeople > 0 ? extensionUnits * malePeople : 0;

  const femaleFirstHourCount = femalePeople > 0 ? femalePeople : 0;
  const femaleExtensionCount =
    femalePeople > 0 ? extensionUnits * femalePeople : 0;

  return {
    input: {
      startTime: convertToJSTFormattedString(parsedStartTime),
      endTime: convertToJSTFormattedString(parsedEndTime),
      malePeople,
      femalePeople,
    },
    hours,
    minutes,
    extensionUnits,
    maleStay: {
      firstHourCount: maleFirstHourCount,
      extensionCount: maleExtensionCount,
    },
    femaleStay: {
      firstHourCount: femaleFirstHourCount,
      extensionCount: femaleExtensionCount,
    },
  };
}

export function calculate(groups: GroupInput[]): CustomActionReturn {
  const validationResult = customFormSchema.safeParse({ groups });

  if (!validationResult.success) {
    return {
      groups: [],
      total: {
        totalPeople: 0,
        totalHours: 0,
        totalMinutes: 0,
        maleStay: { firstHourCount: 0, extensionCount: 0 },
        femaleStay: { firstHourCount: 0, extensionCount: 0 },
      },
      success: false,
      errors: validationResult.error.errors.map((err) => {
        // path: ["groups", index, field] の形を想定
        const [, maybeIndex, maybeField] = err.path;
        return {
          groupIndex:
            typeof maybeIndex === "number" ? maybeIndex : undefined,
          field: maybeField ?? err.path[0],
          message: err.message,
        };
      }),
    };
  }

  const groupResults = groups.map(calculateGroup);

  const total = groupResults.reduce(
    (acc, g) => {
      const minutes = g.hours * 60 + g.minutes;
      const people = g.input.malePeople + g.input.femalePeople;
      acc.totalPeople += people;
      acc.totalPersonMinutes += minutes * people;
      acc.maleStay.firstHourCount += g.maleStay.firstHourCount;
      acc.maleStay.extensionCount += g.maleStay.extensionCount;
      acc.femaleStay.firstHourCount += g.femaleStay.firstHourCount;
      acc.femaleStay.extensionCount += g.femaleStay.extensionCount;
      return acc;
    },
    {
      totalPeople: 0,
      totalPersonMinutes: 0,
      maleStay: { firstHourCount: 0, extensionCount: 0 },
      femaleStay: { firstHourCount: 0, extensionCount: 0 },
    },
  );

  return {
    groups: groupResults,
    total: {
      totalPeople: total.totalPeople,
      totalHours: Math.floor(total.totalPersonMinutes / 60),
      totalMinutes: total.totalPersonMinutes % 60,
      maleStay: total.maleStay,
      femaleStay: total.femaleStay,
    },
    success: true,
  };
}
