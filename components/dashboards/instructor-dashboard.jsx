"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Video,
  FileText,
  Loader2,
  CheckCircle2,
  BarChart3,
  Users,
  Search,
  Check,
  X,
} from "lucide-react";

export function InstructorDashboard({ user, data }) {
  const { instructor, courses, topicsByCourse = [], courseStats = [] } = data;
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [notes, setNotes] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [courseName, setCourseName] = useState("");
  const [programType, setProgramType] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [textbooks, setTextbooks] = useState([]);
  const [availableTextbooks, setAvailableTextbooks] = useState([]);
  const [newTextbookName, setNewTextbookName] = useState("");
  const [newTextbookAuthor, setNewTextbookAuthor] = useState("");
  const [newTextbookPublication, setNewTextbookPublication] = useState("");
  const [showTextbookSuggestions, setShowTextbookSuggestions] = useState(false);
  const [loadingTextbooks, setLoadingTextbooks] = useState(false);
  const [creatingNewTextbook, setCreatingNewTextbook] = useState(false);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [searchStudent, setSearchStudent] = useState("");
  const [marksToApply, setMarksToApply] = useState({});
  const [approvingStudent, setApprovingStudent] = useState(null);

  const selectedCourse = courses.find((c) => c.course_id === selectedCourseId);

  function selectCourse(courseId) {
    const course = courses.find((c) => c.course_id === courseId);
    if (course) {
      setSelectedCourseId(courseId);
      setCourseName(course.course_name || "");
      setProgramType(course.program_type || "");
      setDuration(course.duration || "");
      setNotes(course.notes || "");
      setVideoUrl(course.video || "");
      setSaved(false);
      // Fetch topics for this course from server
      fetchCourseTopics(courseId);
      fetchAvailableTopics();
      // Fetch textbooks for this course
      fetchCourseTextbooks(courseId);
      fetchAvailableTextbooks();
      // fetch enrollments for marks
      fetchEnrollments(courseId);
    }
  }

  async function fetchEnrollments(courseId) {
    setLoadingEnrollments(true);
    try {
      const res = await fetch(`/api/courses/enrollments?courseId=${courseId}`);
      if (res.ok) {
        const json = await res.json();
        setEnrollments(json.enrollments || []);
      } else {
        setEnrollments([]);
      }
    } catch (e) {
      setEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  }

  async function fetchAvailableTopics() {
    setLoadingTopics(true);
    try {
      const res = await fetch("/api/courses/topics?all=true");
      if (res.ok) {
        const json = await res.json();
        setAvailableTopics(json.topics || []);
      }
    } catch (e) {
      console.error("Failed to fetch available topics:", e);
    } finally {
      setLoadingTopics(false);
    }
  }

  async function fetchCourseTopics(courseId) {
    try {
      const res = await fetch(`/api/courses/topics?courseId=${courseId}`);
      if (res.ok) {
        const json = await res.json();
        setTopics(json.topics || []);
      }
    } catch (e) {
      console.error("Failed to fetch course topics:", e);
    }
  }

  async function fetchAvailableTextbooks() {
    setLoadingTextbooks(true);
    try {
      const res = await fetch("/api/textbooks");
      const data = await res.json();
      setAvailableTextbooks(data.textbooks || []);
    } catch (error) {
      console.error("Error fetching available textbooks:", error);
    } finally {
      setLoadingTextbooks(false);
    }
  }

  async function fetchCourseTextbooks(courseId) {
    if (!courseId) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/textbooks`);
      const data = await res.json();
      setTextbooks(data.allTextbooks || []);
    } catch (error) {
      console.error("Error fetching course textbooks:", error);
    }
  }

  async function handleSave() {
    if (!selectedCourseId) return;
    setSaving(true);
    try {
      const payload = {
        courseId: selectedCourseId,
        programType,
        duration,
        notes,
        video: videoUrl,
      };
      console.log("Sending update request with payload:", payload);

      const res = await fetch("/api/courses/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Response status:", res.status, "Data:", data);

      if (res.ok) {
        setSaved(true);
        router.refresh();
      } else {
        console.error("Update failed:", data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert(`Error: ${error.message}`);
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
        <Card className="col-span-1">
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${selectedCourseId === course.course_id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{course.course_name}</p>
                  <p
                    className={`text-xs ${selectedCourseId === course.course_id
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
                      {courseName || selectedCourse.course_name}
                    </CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="mt-1">
                        {programType || selectedCourse.program_type}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 items-center">
                    {saved && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-chart-3 text-chart-3"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Saved
                      </Badge>
                    )}
                    <Button
                      onClick={() => setShowApprovalModal(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approvals
                    </Button>
                    <Button
                      onClick={() => setShowMarksModal(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Manage Marks
                    </Button>
                    <Button
                      onClick={() => setShowAnalyticsModal(true)}
                      variant="outline"
                      size="sm"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analytics
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="courseName">Course Name</Label>
                    <Input
                      id="courseName"
                      value={courseName}
                      disabled
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">
                      Course name cannot be edited
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="programType">Program Type</Label>
                    <Select
                      value={programType || ""}
                      onValueChange={(value) => {
                        setProgramType(value);
                        setSaved(false);
                      }}
                    >
                      <SelectTrigger id="programType">
                        <SelectValue placeholder="Select program type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professional">
                          Professional
                        </SelectItem>
                        <SelectItem value="Certificate">Certificate</SelectItem>
                        <SelectItem value="Degree">Degree</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 8, 8 weeks, 2 months, 1 year"
                      value={duration}
                      onChange={(e) => {
                        setDuration(e.target.value);
                        setSaved(false);
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a number or format like "8 weeks", "2 months", "1
                      year"
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Topics</h3>
                  <div className="relative mb-3">
                    <Input
                      placeholder="Search and add topics..."
                      value={newTopic}
                      onChange={(e) => {
                        setNewTopic(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 200)
                      }
                    />
                    {showSuggestions && newTopic && (
                      <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {availableTopics
                          .filter(
                            (t) =>
                              !topics.some(
                                (ct) => ct.topic_id === t.topic_id,
                              ) &&
                              t.topic_name
                                .toLowerCase()
                                .includes(newTopic.toLowerCase()),
                          )
                          .map((t) => (
                            <button
                              key={t.topic_id}
                              onClick={async () => {
                                if (!selectedCourseId) return;
                                const res = await fetch("/api/courses/topics", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    courseId: selectedCourseId,
                                    topicName: t.topic_name,
                                  }),
                                });
                                if (res.ok) {
                                  setNewTopic("");
                                  setShowSuggestions(false);
                                  fetchCourseTopics(selectedCourseId);
                                }
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-secondary text-sm"
                            >
                              {t.topic_name}
                            </button>
                          ))}
                        {availableTopics.filter(
                          (t) =>
                            !topics.some((ct) => ct.topic_id === t.topic_id) &&
                            t.topic_name
                              .toLowerCase()
                              .includes(newTopic.toLowerCase()),
                        ).length === 0 && (
                            <button
                              onClick={async () => {
                                if (!selectedCourseId || !newTopic) return;
                                const res = await fetch("/api/courses/topics", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    courseId: selectedCourseId,
                                    topicName: newTopic,
                                  }),
                                });
                                if (res.ok) {
                                  setNewTopic("");
                                  setShowSuggestions(false);
                                  fetchCourseTopics(selectedCourseId);
                                }
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-secondary text-sm font-medium text-chart-1"
                            >
                              + Add new topic: "{newTopic}"
                            </button>
                          )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {topics && topics.length > 0 ? (
                      topics.map((t) => (
                        <Badge
                          key={t.topic_id}
                          className="flex items-center gap-2"
                        >
                          {t.topic_name}
                          <button
                            onClick={async () => {
                              const res = await fetch(
                                `/api/courses/topics?courseId=${selectedCourseId}&topicId=${t.topic_id}`,
                                { method: "DELETE" },
                              );
                              if (res.ok) {
                                // Refetch topics from server
                                fetchCourseTopics(selectedCourseId);
                              }
                            }}
                            className="ml-2 text-xs hover:text-red-400"
                          >
                            ×
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No topics linked to this course yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Textbooks Section */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Textbooks</h3>
                  <div className="relative mb-3">
                    <Input
                      placeholder="Search and add textbooks..."
                      value={newTextbookName}
                      onChange={(e) => {
                        setNewTextbookName(e.target.value);
                        setShowTextbookSuggestions(true);
                        setCreatingNewTextbook(false);
                      }}
                      onFocus={() => setShowTextbookSuggestions(true)}
                      onBlur={() =>
                        setTimeout(() => setShowTextbookSuggestions(false), 200)
                      }
                    />
                    {showTextbookSuggestions && newTextbookName && (
                      <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {availableTextbooks
                          .filter(
                            (t) =>
                              !textbooks.some(
                                (ct) => ct.book_id === t.book_id,
                              ) &&
                              t.name
                                .toLowerCase()
                                .includes(newTextbookName.toLowerCase()),
                          )
                          .map((t) => (
                            <button
                              key={t.book_id}
                              onClick={async () => {
                                if (!selectedCourseId) return;
                                const res = await fetch(
                                  `/api/courses/${selectedCourseId}/textbooks`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      bookId: t.book_id,
                                    }),
                                  },
                                );
                                if (res.ok) {
                                  setNewTextbookName("");
                                  setNewTextbookAuthor("");
                                  setNewTextbookPublication("");
                                  setShowTextbookSuggestions(false);
                                  setCreatingNewTextbook(false);
                                  fetchCourseTextbooks(selectedCourseId);
                                }
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-secondary text-sm"
                            >
                              <div className="font-medium">{t.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {t.author && `by ${t.author}`}
                                {t.publication && ` (${t.publication})`}
                              </div>
                            </button>
                          ))}
                        {availableTextbooks.filter(
                          (t) =>
                            !textbooks.some((ct) => ct.book_id === t.book_id) &&
                            t.name
                              .toLowerCase()
                              .includes(newTextbookName.toLowerCase()),
                        ).length === 0 && (
                            <button
                              onClick={() => setCreatingNewTextbook(true)}
                              className="w-full text-left px-3 py-2 hover:bg-secondary text-sm text-primary font-medium"
                            >
                              + Add new textbook: "{newTextbookName}"
                            </button>
                          )}
                      </div>
                    )}
                  </div>

                  {/* Author and Publication Fields - Only show when creating new textbook */}
                  {creatingNewTextbook && (
                    <div className="space-y-3 mb-3 p-3 bg-secondary/30 rounded-md border">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="textbookAuthor" className="text-xs">
                            Author
                          </Label>
                          <Input
                            id="textbookAuthor"
                            placeholder="Author name..."
                            value={newTextbookAuthor}
                            onChange={(e) =>
                              setNewTextbookAuthor(e.target.value)
                            }
                            size="sm"
                            className="text-sm"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label
                            htmlFor="textbookPublication"
                            className="text-xs"
                          >
                            Publication
                          </Label>
                          <Input
                            id="textbookPublication"
                            placeholder="Publisher name..."
                            value={newTextbookPublication}
                            onChange={(e) =>
                              setNewTextbookPublication(e.target.value)
                            }
                            size="sm"
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={async () => {
                            if (!selectedCourseId || !newTextbookName) return;
                            const res = await fetch(
                              `/api/courses/${selectedCourseId}/textbooks`,
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  bookName: newTextbookName,
                                  author: newTextbookAuthor || null,
                                  publication: newTextbookPublication || null,
                                }),
                              },
                            );
                            if (res.ok) {
                              setNewTextbookName("");
                              setNewTextbookAuthor("");
                              setNewTextbookPublication("");
                              setShowTextbookSuggestions(false);
                              setCreatingNewTextbook(false);
                              fetchCourseTextbooks(selectedCourseId);
                              fetchAvailableTextbooks();
                            }
                          }}
                          size="sm"
                          className="flex-1"
                        >
                          Add Textbook
                        </Button>
                        <Button
                          onClick={() => {
                            setCreatingNewTextbook(false);
                            setNewTextbookAuthor("");
                            setNewTextbookPublication("");
                          }}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    {textbooks.map((textbook) => (
                      <Badge
                        key={textbook.book_id}
                        variant="secondary"
                        className="gap-2 py-1"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-xs">
                            {textbook.name}
                          </span>
                          {textbook.author && (
                            <span className="text-xs opacity-75">
                              by {textbook.author}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={async () => {
                            if (!selectedCourseId) return;
                            const res = await fetch(
                              `/api/courses/${selectedCourseId}/textbooks?bookId=${textbook.book_id}`,
                              {
                                method: "DELETE",
                              },
                            );
                            if (res.ok) {
                              fetchCourseTextbooks(selectedCourseId);
                            }
                          }}
                          className="text-xs hover:opacity-75"
                        >
                          ✕
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {textbooks.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No textbooks linked to this course yet
                    </p>
                  )}
                </div>

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
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-fit"
                >
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

        {/* Manage Marks Modal */}
        <Dialog
          open={showMarksModal}
          onOpenChange={(open) => {
            setShowMarksModal(open);
            if (!open) {
              setSearchStudent("");
              setMarksToApply({});
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Student Marks</DialogTitle>
              <DialogDescription>
                Update evaluation scores for students in{" "}
                {courseName || selectedCourse?.course_name}
              </DialogDescription>
            </DialogHeader>

            {/* Search Bar */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by student ID or name..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loadingEnrollments ? (
              <p className="text-center py-4">Loading enrollments...</p>
            ) : (
              (() => {
                const approvedEnrollments = enrollments.filter(
                  (e) => e.approved === true,
                );
                if (approvedEnrollments.length === 0) {
                  return (
                    <p className="text-center py-4 text-muted-foreground">
                      No approved students in this course. Check the Approvals
                      section to approve pending students.
                    </p>
                  );
                }

                const filteredEnrollments = approvedEnrollments.filter(
                  (e) =>
                    e.student_id.toString().includes(searchStudent) ||
                    e.student_name
                      .toLowerCase()
                      .includes(searchStudent.toLowerCase()),
                );

                return (
                  <>
                    <div className="text-sm text-muted-foreground mb-2">
                      Showing {filteredEnrollments.length} of{" "}
                      {approvedEnrollments.length} approved students
                    </div>
                    {filteredEnrollments.length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground">
                        No students match your search.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-secondary">
                            <tr>
                              <th className="px-4 py-3 text-left">
                                Student ID
                              </th>
                              <th className="px-4 py-3 text-left">
                                Student Name
                              </th>
                              <th className="px-4 py-3 text-left">
                                Enrolled Date
                              </th>
                              <th className="px-4 py-3 text-center">
                                Evaluation (0-100)
                              </th>
                              <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredEnrollments.map((e) => (
                              <tr
                                key={e.enroll_id}
                                className="border-b hover:bg-secondary/50"
                              >
                                <td className="px-4 py-3">{e.student_id}</td>
                                <td className="px-4 py-3 font-medium">
                                  {e.student_name}
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                  {new Date(e.enroll_date).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    defaultValue={e.evaluation ?? ""}
                                    placeholder="Enter mark"
                                    onChange={(ev) => {
                                      const val = Number(ev.target.value);
                                      setMarksToApply({
                                        ...marksToApply,
                                        [e.enroll_id]: val,
                                      });
                                    }}
                                    className="w-20"
                                  />
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Button
                                    onClick={async () => {
                                      const val = marksToApply[e.enroll_id];
                                      if (
                                        val === undefined ||
                                        Number.isNaN(val)
                                      )
                                        return;
                                      await fetch("/api/courses/marks", {
                                        method: "PUT",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          courseId: selectedCourseId,
                                          studentId: e.student_id,
                                          evaluation: val,
                                        }),
                                      });
                                      fetchEnrollments(selectedCourseId);
                                      setMarksToApply({
                                        ...marksToApply,
                                        [e.enroll_id]: undefined,
                                      });
                                    }}
                                    size="sm"
                                    variant="default"
                                  >
                                    Apply
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                );
              })()
            )}
          </DialogContent>
        </Dialog>

        {/* Course Analytics Modal */}
        <Dialog open={showAnalyticsModal} onOpenChange={setShowAnalyticsModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Course Analytics</DialogTitle>
              <DialogDescription>
                Performance metrics for{" "}
                {courseName || selectedCourse?.course_name}
              </DialogDescription>
            </DialogHeader>
            {selectedCourseId ? (
              (() => {
                const stats = courseStats.find(
                  (s) => s.course_id === selectedCourseId,
                );
                const approvedEnrollments = enrollments.filter(
                  (e) => e.approved === true,
                );
                const pendingEnrollments = enrollments.filter(
                  (e) => e.approved === false,
                );
                const gradedEnrollments = approvedEnrollments.filter(
                  (e) => e.evaluation !== null,
                );
                const avgEval =
                  gradedEnrollments.length > 0
                    ? (
                      gradedEnrollments.reduce(
                        (sum, e) => sum + e.evaluation,
                        0,
                      ) / gradedEnrollments.length
                    ).toFixed(1)
                    : "N/A";
                const maxEval =
                  gradedEnrollments.length > 0
                    ? Math.max(...gradedEnrollments.map((e) => e.evaluation))
                    : "N/A";
                const minEval =
                  gradedEnrollments.length > 0
                    ? Math.min(...gradedEnrollments.map((e) => e.evaluation))
                    : "N/A";

                return (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">
                          Total Enrolled
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {enrollments.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          students
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-yellow-600">
                          Pending
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">
                          {pendingEnrollments.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          awaiting approval
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Graded</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {gradedEnrollments.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {enrollments.length > 0
                            ? `${Math.round(
                              (gradedEnrollments.length /
                                enrollments.length) *
                              100,
                            )}%`
                            : "0%"}{" "}
                          complete
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Average Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{avgEval}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          out of 100
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Range</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm">
                          <p>
                            <span className="font-semibold">Max:</span>{" "}
                            {maxEval}
                          </p>
                          <p>
                            <span className="font-semibold">Min:</span>{" "}
                            {minEval}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()
            ) : (
              <p className="text-muted-foreground">
                Select a course to view analytics
              </p>
            )}
          </DialogContent>
        </Dialog>

        {/* Approve/Reject Students Modal */}
        <Dialog
          open={showApprovalModal}
          onOpenChange={(open) => {
            setShowApprovalModal(open);
            if (!open) {
              setSearchStudent("");
              setApprovingStudent(null);
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Approve/Reject Students</DialogTitle>
              <DialogDescription>
                Manage enrollment approvals for{" "}
                {courseName || selectedCourse?.course_name}
              </DialogDescription>
            </DialogHeader>

            {/* Search Bar */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by student ID or name..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loadingEnrollments ? (
              <p className="text-center py-4">Loading enrollments...</p>
            ) : (
              (() => {
                const pendingEnrollments = enrollments.filter(
                  (e) => e.approved === false,
                );

                if (pendingEnrollments.length === 0) {
                  return (
                    <p className="text-center py-4 text-muted-foreground">
                      No pending approval requests for this course.
                    </p>
                  );
                }

                const filteredPending = pendingEnrollments.filter(
                  (e) =>
                    e.student_id.toString().includes(searchStudent) ||
                    e.student_name
                      .toLowerCase()
                      .includes(searchStudent.toLowerCase()),
                );

                return (
                  <>
                    <div className="text-sm text-muted-foreground mb-2">
                      Showing {filteredPending.length} of{" "}
                      {pendingEnrollments.length} pending requests
                    </div>
                    {filteredPending.length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground">
                        No students match your search.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-secondary">
                            <tr>
                              <th className="px-4 py-3 text-left">
                                Student ID
                              </th>
                              <th className="px-4 py-3 text-left">
                                Student Name
                              </th>
                              <th className="px-4 py-3 text-left">
                                Enrolled Date
                              </th>
                              <th className="px-4 py-3 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPending.map((e) => (
                              <tr
                                key={e.enroll_id}
                                className="border-b hover:bg-secondary/50"
                              >
                                <td className="px-4 py-3">{e.student_id}</td>
                                <td className="px-4 py-3 font-medium">
                                  {e.student_name}
                                </td>
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                  {new Date(e.enroll_date).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-center flex gap-2 justify-center">
                                  <Button
                                    onClick={async () => {
                                      setApprovingStudent(e.enroll_id);
                                      try {
                                        const res = await fetch(
                                          "/api/courses/enrollments/approve",
                                          {
                                            method: "PUT",
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                            },
                                            body: JSON.stringify({
                                              courseId: selectedCourseId,
                                              studentId: e.student_id,
                                              action: "approve",
                                            }),
                                          },
                                        );
                                        if (res.ok) {
                                          fetchEnrollments(selectedCourseId);
                                        }
                                      } finally {
                                        setApprovingStudent(null);
                                      }
                                    }}
                                    disabled={approvingStudent === e.enroll_id}
                                    size="sm"
                                    variant="default"
                                    className="gap-1"
                                  >
                                    {approvingStudent === e.enroll_id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={async () => {
                                      setApprovingStudent(e.enroll_id);
                                      try {
                                        const res = await fetch(
                                          "/api/courses/enrollments/approve",
                                          {
                                            method: "PUT",
                                            headers: {
                                              "Content-Type":
                                                "application/json",
                                            },
                                            body: JSON.stringify({
                                              courseId: selectedCourseId,
                                              studentId: e.student_id,
                                              action: "reject",
                                            }),
                                          },
                                        );
                                        if (res.ok) {
                                          fetchEnrollments(selectedCourseId);
                                        }
                                      } finally {
                                        setApprovingStudent(null);
                                      }
                                    }}
                                    disabled={approvingStudent === e.enroll_id}
                                    size="sm"
                                    variant="destructive"
                                    className="gap-1"
                                  >
                                    {approvingStudent === e.enroll_id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <X className="h-4 w-4" />
                                    )}
                                    Reject
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                );
              })()
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
