export const daysInMonth = 31;

export type Habit = {
  name: string;
  data: number[];
};

export type Group = {
  group: string;
  score: (number | string)[];
  habits: Habit[];
};

export const initialData: Group[] = [
  {
    group: "Утро",
    score: Array(daysInMonth)
      .fill("")
      .map((_, i) => [50, 100, 100, 50][i] ?? ""),
    habits: [
      {
        name: "Умывался",
        data: Array(daysInMonth)
          .fill(0)
          .map((_, i) => [0, 1, 1, 0][i] ?? 0),
      },
      {
        name: "Заходил в приложение",
        data: Array(daysInMonth)
          .fill(0)
          .map((_, i) => [0, 1, 1, 0][i] ?? 0),
      },
    ],
  },
];