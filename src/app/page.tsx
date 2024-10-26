import TimeCalculator from "@/features/calculator/TimeCalculator";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_34px] justify-items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <TimeCalculator />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center mb-2">
        <span className="text-indigo-400">神楽堂</span>
      </footer>
    </div>
  );
}
