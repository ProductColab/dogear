"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

interface StatsSectionProps {
  booksRead: number;
  booksReading: number;
  totalPages: number;
  avgPages: number;
  avgYear: number | null;
  genreData: { name: string; value: number }[];
  readByYear: { year: string; count: number }[];
  longestBook: { title: string; pageCount: number } | null;
  shortestBook: { title: string; pageCount: number } | null;
}

const GENRE_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
];

export function StatsSection({
  booksRead, booksReading, totalPages, avgPages, avgYear,
  genreData, readByYear, longestBook, shortestBook,
}: StatsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Reading progress cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Books Read</p>
          <p className="text-3xl font-bold text-green-600">{booksRead}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Reading Now</p>
          <p className="text-3xl font-bold text-amber-600">{booksReading}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Pages</p>
          <p className="text-3xl font-bold">{totalPages.toLocaleString()}</p>
          {avgPages > 0 && <p className="text-xs text-muted-foreground">avg {avgPages} per book</p>}
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Avg Pub Year</p>
          <p className="text-3xl font-bold">{avgYear ?? "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre donut */}
        {genreData.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm font-semibold mb-4">Top Genres</p>
            <div className="flex gap-4 items-center">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={genreData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                    {genreData.map((_, i) => (
                      <Cell key={i} fill={GENRE_COLORS[i % GENRE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} books`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="space-y-1.5 min-w-0 flex-1">
                {genreData.slice(0, 6).map((g, i) => (
                  <li key={g.name} className="flex items-center gap-2 text-sm min-w-0">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: GENRE_COLORS[i % GENRE_COLORS.length] }} />
                    <span className="truncate text-muted-foreground">{g.name}</span>
                    <span className="ml-auto font-medium shrink-0">{g.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Books finished per year */}
        {readByYear.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm font-semibold mb-4">Books Finished by Year Added</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={readByYear} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} className="fill-muted-foreground" />
                <Tooltip />
                <Bar dataKey="count" name="Books" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Longest / shortest */}
      {(longestBook || shortestBook) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {longestBook && (
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Longest Book</p>
              <p className="font-semibold text-sm leading-snug line-clamp-2">{longestBook.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{longestBook.pageCount.toLocaleString()} pages</p>
            </div>
          )}
          {shortestBook && (
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Shortest Book</p>
              <p className="font-semibold text-sm leading-snug line-clamp-2">{shortestBook.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{shortestBook.pageCount.toLocaleString()} pages</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
