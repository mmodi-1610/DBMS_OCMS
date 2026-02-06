"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, BarChart3, UserSearch } from "lucide-react";

export function AnalyticsFilters({
  filters,
  onFilterChange,
  onReset,
  programTypes = [],
  courses = [],
}) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-end gap-4 p-4">
        {/* View Toggle */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            View
          </label>
          <div className="flex rounded-md border">
            <button
              type="button"
              onClick={() => onFilterChange({ view: "course" })}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-l-md transition-colors cursor-pointer ${
                filters.view === "course"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Course-wise
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ view: "student" })}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-r-md transition-colors cursor-pointer ${
                filters.view === "student"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <UserSearch className="h-3.5 w-3.5" />
              Student-wise
            </button>
          </div>
        </div>

        {/* Program Type */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Program Type
          </label>
          <select
            value={filters.programType}
            onChange={(e) => onFilterChange({ programType: e.target.value })}
            className="h-9 rounded-md border bg-background px-3 text-sm text-foreground cursor-pointer"
          >
            <option value="">All Programs</option>
            {programTypes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Course */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Course
          </label>
          <select
            value={filters.courseId}
            onChange={(e) => onFilterChange({ courseId: e.target.value })}
            className="h-9 rounded-md border bg-background px-3 text-sm text-foreground cursor-pointer"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.course_id} value={c.course_id}>
                {c.course_name}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            From
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange({ startDate: e.target.value })}
            className="h-9 rounded-md border bg-background px-3 text-sm text-foreground cursor-pointer"
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            To
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange({ endDate: e.target.value })}
            className="h-9 rounded-md border bg-background px-3 text-sm text-foreground cursor-pointer"
          />
        </div>

        {/* Reset */}
        <Button variant="outline" size="sm" onClick={onReset} className="h-9 cursor-pointer">
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Reset
        </Button>
      </CardContent>
    </Card>
  );
}
