import { date, z } from "zod";

const peopleSchema = z
  .object({
    malePeople: z.number(),
    femalePeople: z.number(),
  })
  .refine((data) => data.malePeople >= 1 || data.femalePeople >= 1, {
    message: "男性または女性の人数は1人以上である必要があります。",
    path: ["people"], // エラーメッセージを表示するフィールド
  });

const dateSchema = z.object({
  startTime: z
    .string()
    .trim()
    .min(1, { message: "入店時間を入力してください" }),
  endTime: z.string().trim().min(1, { message: "退店時間を入力してください" }),
});

export const formSchema = z.intersection(dateSchema, peopleSchema);

export type FormValues = z.infer<typeof formSchema>;
