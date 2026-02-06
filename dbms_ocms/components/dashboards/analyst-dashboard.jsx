"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Users, GraduationCap, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = [
  "hsl(192, 70%, 35%)",
  "hsl(38, 90%, 55%)",
  "hsl(160, 50%, 40%)",
  "hsl(220, 60%, 55%)",
  "hsl(340, 65%, 55%)",
];

export function AnalystDashboard({ data }) {
  const { enrollmentStats, performanceDistribution, summary } = data;

  const barData = enrollmentStats.map((s) => ({
    name:
      s.course_name.length > 18
        ? s.course_name.substring(0, 18) + "..."
        : s.course_name,
    enrollments: Number(s.enrollment_count),
    avgGrade: Number(s.avg_evaluation) || 0,
  }));

  const pieData = performanceDistribution.map((d) => ({
    name: d.grade_range,
    value: Number(d.count),
  }));

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div id="dashboard">
        <h1 className="text-2xl font-bold text-foreground font-serif">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Course enrollment and student performance metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div id="analytics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {summary.totalCourses}
              </p>
              <p className="text-sm text-muted-foreground">Total Courses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <Users className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {summary.totalStudents}
              </p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
              <GraduationCap className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {summary.totalEnrollments}
              </p>
              <p className="text-sm text-muted-foreground">
                Total Enrollments
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
              <TrendingUp className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {summary.avgEvaluation || "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">Avg Grade</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-serif">
              Enrollment by Course
            </CardTitle>
            <CardDescription>
              Number of students enrolled per course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(200, 15%, 88%)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(200, 15%, 88%)",
                      fontSize: "13px",
                    }}
                  />
                  <Bar
                    dataKey="enrollments"
                    fill="hsl(192, 70%, 35%)"
                    radius={[4, 4, 0, 0]}
                    name="Enrollments"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-serif">
              Grade Distribution
            </CardTitle>
            <CardDescription>Student performance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-serif">
            Course Performance Details
          </CardTitle>
          <CardDescription>
            Enrollment counts and evaluation metrics per course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Course</th>
                  <th className="pb-3 pr-4 font-medium">Program</th>
                  <th className="pb-3 pr-4 font-medium text-right">
                    Enrolled
                  </th>
                  <th className="pb-3 pr-4 font-medium text-right">
                    Avg Grade
                  </th>
                  <th className="pb-3 pr-4 font-medium text-right">Min</th>
                  <th className="pb-3 font-medium text-right">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {enrollmentStats.map((s) => (
                  <tr key={s.course_id}>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {s.course_name}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="secondary">{s.program_type}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-right text-foreground">
                      {s.enrollment_count}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {s.avg_evaluation ? (
                        <Badge
                          variant={
                            Number(s.avg_evaluation) >= 70
                              ? "default"
                              : "destructive"
                          }
                        >
                          {s.avg_evaluation}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right text-muted-foreground">
                      {s.min_evaluation ?? "-"}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      {s.max_evaluation ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
