"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, BookOpen, Clock, GraduationCap, Loader2 } from "lucide-react";

export function StudentDashboard({ user, data }) {
  const { student, enrollments, courses } = data;
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const router = useRouter();

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));

  const filteredCourses = courses.filter((c) => {
    const name = c.course_name.toLowerCase();
    const program = c.program_type.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || program.includes(q);
  });

  async function handleEnroll(courseId) {
    if (!student) return;
    setEnrolling(true);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          studentId: student.student_id,
        }),
      });
      if (res.ok) {
        setSelectedCourse(null);
        router.refresh();
      }
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div id="dashboard">
        <h1 className="text-2xl font-bold text-foreground font-serif">
          Welcome back, {student ? student.name : user.username}
        </h1>
        <p className="text-muted-foreground">
          Browse courses and track your progress
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {enrollments.length}
              </p>
              <p className="text-sm text-muted-foreground">Enrolled Courses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <GraduationCap className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {enrollments.filter((e) => e.evaluation !== null).length}
              </p>
              <p className="text-sm text-muted-foreground">Graded</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
              <Clock className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {student?.skill_level || "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">Skill Level</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Enrollments */}
      {enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">My Enrollments</CardTitle>
            <CardDescription>
              Your current courses and grades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Course</th>
                    <th className="pb-3 pr-4 font-medium">Program</th>
                    <th className="pb-3 pr-4 font-medium">Duration</th>
                    <th className="pb-3 pr-4 font-medium">Enrolled</th>
                    <th className="pb-3 font-medium">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {enrollments.map((e) => (
                    <tr key={e.enroll_id}>
                      <td className="py-3 pr-4 font-medium text-foreground">
                        {e.course_name}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary">{e.program_type}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {e.duration}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {new Date(e.enroll_date).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        {e.evaluation !== null ? (
                          <Badge
                            variant={
                              e.evaluation >= 70 ? "default" : "destructive"
                            }
                          >
                            {e.evaluation}/100
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Browse Courses */}
      <Card id="browse-courses">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-serif">Browse Courses</CardTitle>
              <CardDescription>
                Find and enroll in available courses
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCourseIds.has(course.course_id);
              return (
                <Card
                  key={course.course_id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => setSelectedCourse(course)}
                >
                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-foreground leading-tight">
                        {course.course_name}
                      </h3>
                      {isEnrolled && (
                        <Badge variant="default" className="shrink-0">
                          Enrolled
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary">{course.program_type}</Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                      </span>
                    </div>
                    {course.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {filteredCourses.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              No courses found matching your search.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Course Detail Dialog */}
      <Dialog
        open={!!selectedCourse}
        onOpenChange={() => setSelectedCourse(null)}
      >
        {selectedCourse && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif">
                {selectedCourse.course_name}
              </DialogTitle>
              <DialogDescription>
                {selectedCourse.program_type} &middot;{" "}
                {selectedCourse.duration}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              {selectedCourse.notes && (
                <div>
                  <h4 className="mb-1 text-sm font-medium text-foreground">
                    Notes
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCourse.notes}
                  </p>
                </div>
              )}
              {selectedCourse.video && (
                <div>
                  <h4 className="mb-1 text-sm font-medium text-foreground">
                    Video
                  </h4>
                  <a
                    href={selectedCourse.video}
                    className="text-sm text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedCourse.video}
                  </a>
                </div>
              )}
              {student && !enrolledCourseIds.has(selectedCourse.course_id) && (
                <Button
                  onClick={() => handleEnroll(selectedCourse.course_id)}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    "Register for this Course"
                  )}
                </Button>
              )}
              {enrolledCourseIds.has(selectedCourse.course_id) && (
                <Badge variant="default" className="w-fit">
                  Already Enrolled
                </Badge>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
