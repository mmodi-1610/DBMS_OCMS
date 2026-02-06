"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

function getMarkColor(score) {
  if (score == null) return "";
  if (score >= 90)
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
  if (score >= 80)
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
  if (score >= 70)
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
  if (score >= 60)
    return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
  return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
}

export function StudentCourseMatrix() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMatrix() {
      try {
        const res = await fetch("/api/analytics/matrix");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMatrix();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading marks matrix…</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12 gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">Failed to load matrix: {error}</span>
        </CardContent>
      </Card>
    );
  }

  const { courses = [], students = [] } = data || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-serif">
          Student × Course Marks Matrix
        </CardTitle>
        <CardDescription>
          Evaluation scores per student per course — hover over cells for details
        </CardDescription>
        <div className="flex flex-wrap gap-3 pt-2">
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getMarkColor(
              95
            )}`}
          >
            90–100
          </span>
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getMarkColor(
              85
            )}`}
          >
            80–89
          </span>
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getMarkColor(
              75
            )}`}
          >
            70–79
          </span>
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getMarkColor(
              65
            )}`}
          >
            60–69
          </span>
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getMarkColor(
              50
            )}`}
          >
            &lt;60
          </span>
          <Badge variant="outline" className="text-xs">
            — Not Enrolled
          </Badge>
          <Badge variant="secondary" className="text-xs">
            In Progress
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-sm border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-3 font-medium sticky left-0 bg-card z-10 min-w-[140px]">
                  Student
                </th>
                {courses.map((c) => (
                  <th
                    key={c.course_id}
                    className="pb-3 px-2 font-medium text-center min-w-[90px]"
                    title={c.course_name}
                  >
                    <span className="block max-w-[100px] truncate mx-auto">
                      {c.course_name.length > 14
                        ? c.course_name.substring(0, 14) + "…"
                        : c.course_name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((student) => (
                <tr
                  key={student.student_id}
                  className="hover:bg-muted/50 cursor-default"
                >
                  <td className="py-2.5 pr-3 font-medium text-foreground sticky left-0 bg-card z-10">
                    <div>{student.student_name}</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {student.skill_level || ""}
                    </div>
                  </td>
                  {courses.map((c) => {
                    const entry = student.grades[c.course_id];
                    if (!entry) {
                      return (
                        <td key={c.course_id} className="py-2.5 px-2 text-center">
                          <span className="text-muted-foreground/40">—</span>
                        </td>
                      );
                    }
                    if (entry.evaluation == null) {
                      return (
                        <td key={c.course_id} className="py-2.5 px-2 text-center">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 cursor-default"
                          >
                            In Progress
                          </Badge>
                        </td>
                      );
                    }
                    return (
                      <td
                        key={c.course_id}
                        className="py-2.5 px-2 text-center"
                        title={`${c.course_name}: ${entry.evaluation}/100`}
                      >
                        <span
                          className={`inline-flex items-center justify-center rounded w-10 h-7 text-xs font-bold cursor-default ${getMarkColor(
                            entry.evaluation
                          )}`}
                        >
                          {entry.evaluation}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
