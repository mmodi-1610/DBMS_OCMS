"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	BookOpen,
	Users,
	GraduationCap,
	TrendingUp,
	Loader2,
	AlertCircle,
} from "lucide-react";
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
import { useAnalytics } from "@/hooks/use-analytics";
import { AnalyticsFilters } from "@/components/dashboards/analytics-filters";
import { StudentCourseMatrix } from "@/components/dashboards/student-course-matrix";

const PIE_COLORS = [
	"hsl(192, 70%, 35%)",
	"hsl(38, 90%, 55%)",
	"hsl(160, 50%, 40%)",
	"hsl(220, 60%, 55%)",
	"hsl(340, 65%, 55%)",
];

export function AnalystDashboard() {
	const { data, loading, error, filters, updateFilters, resetFilters } =
		useAnalytics();

	if (loading && !data) {
		return (
			<div className="flex items-center justify-center min-h-[60vh] gap-2 text-muted-foreground">
				<Loader2 className="h-5 w-5 animate-spin" />
				<span>Loading analytics…</span>
			</div>
		);
	}

	if (error && !data) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 text-destructive">
				<AlertCircle className="h-8 w-8" />
				<p className="text-sm">Failed to load analytics: {error}</p>
			</div>
		);
	}

	const {
		enrollmentStats = [],
		performanceDistribution = [],
		studentStats = [],
		summary = {},
		filters: filterOptions = {},
	} = data || {};

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

	const studentBarData = studentStats.slice(0, 20).map((s) => ({
		name:
			s.student_name.length > 16
				? s.student_name.substring(0, 16) + "..."
				: s.student_name,
		avgGrade: Number(s.avg_grade) || 0,
		courses: Number(s.courses_enrolled),
	}));

	return (
		<div className="flex flex-col gap-6 p-6 pr-8 lg:p-8 lg:pr-10 overflow-x-hidden">
			<div id="dashboard">
				<h1 className="text-2xl font-bold text-foreground font-serif">
					Analytics Dashboard
				</h1>
				<p className="text-muted-foreground">
					Course enrollment and student performance metrics
				</p>
			</div>

			{/* Filters */}
			<AnalyticsFilters
				filters={filters}
				onFilterChange={updateFilters}
				onReset={resetFilters}
				programTypes={filterOptions.programTypes || []}
				courses={filterOptions.courses || []}
			/>

			{/* Loading overlay for filter changes */}
			{loading && data && (
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin" />
					Updating…
				</div>
			)}

			{/* KPI Cards */}
			<div
				id="analytics"
				className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
			>
				<Card className="cursor-default">
					<CardContent className="flex items-center gap-4 p-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
							<BookOpen className="h-5 w-5 text-primary" />
						</div>
						<div>
							<p className="text-2xl font-bold text-foreground">
								{summary.totalCourses ?? 0}
							</p>
							<p className="text-sm text-muted-foreground">
								Total Courses
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="cursor-default">
					<CardContent className="flex items-center gap-4 p-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
							<Users className="h-5 w-5 text-accent-foreground" />
						</div>
						<div>
							<p className="text-2xl font-bold text-foreground">
								{summary.totalStudents ?? 0}
							</p>
							<p className="text-sm text-muted-foreground">
								Total Students
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="cursor-default">
					<CardContent className="flex items-center gap-4 p-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
							<GraduationCap className="h-5 w-5 text-chart-3" />
						</div>
						<div>
							<p className="text-2xl font-bold text-foreground">
								{summary.totalEnrollments ?? 0}
							</p>
							<p className="text-sm text-muted-foreground">
								Total Enrollments
							</p>
						</div>
					</CardContent>
				</Card>
				<Card className="cursor-default">
					<CardContent className="flex items-center gap-4 p-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
							<TrendingUp className="h-5 w-5 text-chart-4" />
						</div>
						<div>
							<p className="text-2xl font-bold text-foreground">
								{summary.avgEvaluation ?? "N/A"}
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
							{filters.view === "student"
								? "Top Students by Average Grade"
								: "Enrollment by Course"}
						</CardTitle>
						<CardDescription>
							{filters.view === "student"
								? "Average grade of top 20 students"
								: "Number of students enrolled per course"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-72">
							<ResponsiveContainer width="100%" height="100%">
								{filters.view === "student" ? (
									<BarChart data={studentBarData} className="cursor-pointer">
										<CartesianGrid
											strokeDasharray="3 3"
											stroke="hsl(200, 15%, 88%)"
										/>
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
											cursor={{ fill: "hsl(200, 15%, 93%)" }}
										/>
										<Bar
											dataKey="avgGrade"
											fill="hsl(220, 60%, 55%)"
											radius={[4, 4, 0, 0]}
											name="Avg Grade"
											className="cursor-pointer"
										/>
										<Bar
											dataKey="courses"
											fill="hsl(160, 50%, 40%)"
											radius={[4, 4, 0, 0]}
											name="Courses Enrolled"
											className="cursor-pointer"
										/>
									</BarChart>
								) : (
									<BarChart data={barData} className="cursor-pointer">
										<CartesianGrid
											strokeDasharray="3 3"
											stroke="hsl(200, 15%, 88%)"
										/>
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
											cursor={{ fill: "hsl(200, 15%, 93%)" }}
										/>
										<Bar
											dataKey="enrollments"
											fill="hsl(192, 70%, 35%)"
											radius={[4, 4, 0, 0]}
											name="Enrollments"
											className="cursor-pointer"
										/>
									</BarChart>
								)}
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
					<CardContent className="pr-2">
						<div className="h-72">
							{pieData.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<PieChart>
										<Pie
											data={pieData}
											cx="50%"
											cy="42%"
											outerRadius={70}
											innerRadius={30}
											dataKey="value"
											paddingAngle={2}
											className="cursor-pointer"
										>
											{pieData.map((_, index) => (
												<Cell
													key={`cell-${index}`}
													fill={
														PIE_COLORS[index % PIE_COLORS.length]
													}
												/>
											))}
										</Pie>
										<Tooltip
											contentStyle={{
												borderRadius: "8px",
												border: "1px solid hsl(200, 15%, 88%)",
												fontSize: "13px",
											}}
											formatter={(value, name) => [
												`${value} students`,
												name,
											]}
										/>
										<Legend
											wrapperStyle={{
												fontSize: "11px",
												paddingTop: "4px",
											}}
											iconSize={10}
											layout="horizontal"
											verticalAlign="bottom"
											align="center"
										/>
									</PieChart>
								</ResponsiveContainer>
							) : (
								<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
									No grade data available
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Student × Course Grade Matrix */}
			<StudentCourseMatrix />

			{/* Course-wise Table */}
			{filters.view === "course" && (
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
							{enrollmentStats.length > 0 ? (
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b text-left text-muted-foreground">
											<th className="pb-3 pr-4 font-medium">Course</th>
											<th className="pb-3 pr-4 font-medium">Program</th>
											<th className="pb-3 pr-4 font-medium">Duration</th>
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
											<tr
												key={s.course_id}
												className="hover:bg-muted/50 cursor-default"
											>
												<td className="py-3 pr-4 font-medium text-foreground">
													{s.course_name}
												</td>
												<td className="py-3 pr-4">
													<Badge variant="secondary">
														{s.program_type || "-"}
													</Badge>
												</td>
												<td className="py-3 pr-4 text-muted-foreground">
													{s.duration || "-"}
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
														<span className="text-muted-foreground">
															-
														</span>
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
							) : (
								<p className="py-8 text-center text-sm text-muted-foreground">
									No course data found for the selected filters.
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Student-wise Table */}
			{filters.view === "student" && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base font-serif">
							Student Performance Details
						</CardTitle>
						<CardDescription>
							Individual student grades and enrollment counts
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							{studentStats.length > 0 ? (
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b text-left text-muted-foreground">
											<th className="pb-3 pr-4 font-medium">Student</th>
											<th className="pb-3 pr-4 font-medium">Skill Level</th>
											<th className="pb-3 pr-4 font-medium">Location</th>
											<th className="pb-3 pr-4 font-medium text-right">
												Courses
											</th>
											<th className="pb-3 pr-4 font-medium text-right">
												Avg Grade
											</th>
											<th className="pb-3 pr-4 font-medium text-right">Min</th>
											<th className="pb-3 font-medium text-right">Max</th>
										</tr>
									</thead>
									<tbody className="divide-y">
										{studentStats.map((s) => (
											<tr
												key={s.student_id}
												className="hover:bg-muted/50 cursor-default"
											>
												<td className="py-3 pr-4 font-medium text-foreground">
													{s.student_name}
												</td>
												<td className="py-3 pr-4">
													<Badge variant="secondary">
														{s.skill_level || "-"}
													</Badge>
												</td>
												<td className="py-3 pr-4 text-muted-foreground">
													{[s.city, s.country]
														.filter(Boolean)
														.join(", ") || "-"}
												</td>
												<td className="py-3 pr-4 text-right text-foreground">
													{s.courses_enrolled}
												</td>
												<td className="py-3 pr-4 text-right">
													{s.avg_grade ? (
														<Badge
															variant={
																Number(s.avg_grade) >= 70
																	? "default"
																	: "destructive"
															}
														>
															{s.avg_grade}
														</Badge>
													) : (
														<span className="text-muted-foreground">
															-
														</span>
													)}
												</td>
												<td className="py-3 pr-4 text-right text-muted-foreground">
													{s.min_grade ?? "-"}
												</td>
												<td className="py-3 text-right text-muted-foreground">
													{s.max_grade ?? "-"}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							) : (
								<p className="py-8 text-center text-sm text-muted-foreground">
									No student data found for the selected filters.
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}