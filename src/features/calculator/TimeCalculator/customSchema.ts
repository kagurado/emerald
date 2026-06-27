import { z } from "zod";

const groupSchema = z
  .object({
    startTime: z
      .string()
      .trim()
      .min(1, { message: "入店時間を入力してください" }),
    endTime: z
      .string()
      .trim()
      .min(1, { message: "退店時間を入力してください" }),
    malePeople: z.number(),
    femalePeople: z.number(),
  })
  .refine((data) => data.malePeople >= 1 || data.femalePeople >= 1, {
    message: "男性または女性の人数は1人以上である必要があります。",
    path: ["people"],
  });

export const customFormSchema = z.object({
  groups: z.array(groupSchema).min(1, {
    message: "グループを1つ以上入力してください",
  }),
});

export type CustomFormValues = z.infer<typeof customFormSchema>;
