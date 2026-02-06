"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Video, FileText, Loader2, CheckCircle2 } from "lucide-react";

export function InstructorDashboard({ user, data }) {
  const { instructor, courses } = data;
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [notes, setNotes] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const selectedCourse = courses.find(
    (c) => c.course_id === selectedCourseId
  );

  function selectCourse(courseId) {
    const course = courses.find((c) => c.course_id === courseId);
    if (course) {
      setSelectedCourseId(courseId);
      setNotes(course.notes || "");
      setVideoUrl(course.video || "");
      setSaved(false);
    }
  }

  async function handleSave() {
    if (!selectedCourseId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/courses/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourseId,
          notes,
          video: videoUrl,
        }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div id="dashboard">
        <h1 className="text-2xl font-bold text-foreground font-serif">
          Instructor Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome, {instructor ? instructor.name : user.username}
          {instructor?.contacts && (
            <span className="ml-1">&middot; {instructor.contacts}</span>
          )}
        </p>
      </div>

      <div id="my-courses" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Course List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-serif">My Courses</CardTitle>
            <CardDescription>
              {courses.length} course{courses.length !== 1 && "s"} assigned
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {courses.map((course) => (
              <button
                type="button"
                key={course.course_id}
                onClick={() => selectCourse(course.course_id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  selectedCourseId === course.course_id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{course.course_name}</p>
                  <p
                    className={`text-xs ${
                      selectedCourseId === course.course_id
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {course.program_type} &middot; {course.duration}
                  </p>
                </div>
              </button>
            ))}
            {courses.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No courses assigned yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Course Editor */}
        <Card className="lg:col-span-2">
          {selectedCourse ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-serif">
                      {selectedCourse.course_name}
                    </CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="mt-1">
                        {selectedCourse.program_type}
                      </Badge>
                    </CardDescription>
                  </div>
                  {saved && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-chart-3 text-chart-3"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Saved
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="notes"
                    className="flex items-center gap-2 text-foreground"
                  >
                    <FileText className="h-4 w-4" />
                    Course Notes
                  </Label>
                  <Textarea
                    id="notes"
                    rows={6}
                    placeholder="Enter course notes or a URL to notes..."
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      setSaved(false);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="video"
                    className="flex items-center gap-2 text-foreground"
                  >
                    <Video className="h-4 w-4" />
                    Video URL
                  </Label>
                  <Input
                    id="video"
                    type="url"
                    placeholder="https://example.com/video"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      setSaved(false);
                    }}
                  />
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-fit">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex h-64 items-center justify-center">
              <div className="text-center">
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">
                  Select a course to manage its content
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
