"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BookOpen,
  Users,
  UserPlus,
  Plus,
  Trash2,
  Loader2,
  Link2,
  Building2,
  Search,
} from "lucide-react";

const sectionToTab = {
  "admin-courses": "courses",
  "admin-assignments": "assignments",
  "admin-students": "students",
  "admin-universities": "universities",
};

export function AdminDashboard({ user, data }) {
  const { courses, students, instructors, instructorCourses, universities } = data;
  const [activeTab, setActiveTab] = useState("courses");
  const tabIdPrefix = useId();

  const handleNavEvent = useCallback((e) => {
    const detail = e.detail;
    const tab = sectionToTab[detail?.section];
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("quadbase:navigate", handleNavEvent);
    return () =>
      window.removeEventListener("quadbase:navigate", handleNavEvent);
  }, [handleNavEvent]);

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div id="dashboard">
        <h1 className="text-2xl font-bold text-foreground font-serif">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage courses, instructors, and students
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {courses.length}
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
                {instructors.length}
              </p>
              <p className="text-sm text-muted-foreground">Instructors</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
              <UserPlus className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {students.length}
              </p>
              <p className="text-sm text-muted-foreground">Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
              <Building2 className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {universities.length}
              </p>
              <p className="text-sm text-muted-foreground">Universities</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses" id={`${tabIdPrefix}-tab-courses`} aria-controls={`${tabIdPrefix}-panel-courses`}>Courses</TabsTrigger>
          <TabsTrigger value="assignments" id={`${tabIdPrefix}-tab-assignments`} aria-controls={`${tabIdPrefix}-panel-assignments`}>Instructors</TabsTrigger>
          <TabsTrigger value="students" id={`${tabIdPrefix}-tab-students`} aria-controls={`${tabIdPrefix}-panel-students`}>Students</TabsTrigger>
          <TabsTrigger value="universities" id={`${tabIdPrefix}-tab-universities`} aria-controls={`${tabIdPrefix}-panel-universities`}>Universities</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-4" id={`${tabIdPrefix}-panel-courses`} aria-labelledby={`${tabIdPrefix}-tab-courses`}>
          <CoursesTab courses={courses} universities={universities} />
        </TabsContent>
        <TabsContent value="assignments" className="mt-4" id={`${tabIdPrefix}-panel-assignments`} aria-labelledby={`${tabIdPrefix}-tab-assignments`}>
          <AssignmentsTab
            instructors={instructors}
            courses={courses}
            instructorCourses={instructorCourses}
            universities={universities}
          />
        </TabsContent>
        <TabsContent value="students" className="mt-4" id={`${tabIdPrefix}-panel-students`} aria-labelledby={`${tabIdPrefix}-tab-students`}>
          <StudentsTab students={students} />
        </TabsContent>
        <TabsContent value="universities" className="mt-4" id={`${tabIdPrefix}-panel-universities`} aria-labelledby={`${tabIdPrefix}-tab-universities`}>
          <UniversitiesTab universities={universities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CoursesTab({ courses, universities }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [programType, setProgramType] = useState("");
  const [duration, setDuration] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState(null);
  const router = useRouter();

  const filteredCourses = courses.filter((c) =>
    c.course_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleDelete(courseId) {
    setDeleting(courseId);
    try {
      const res = await fetch(`/api/courses?id=${courseId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName: name,
          programType,
          duration,
          universityId: universityId || null,
        }),
      });
      if (res.ok) {
        setOpen(false);
        setName("");
        setProgramType("");
        setDuration("");
        setUniversityId("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-serif">All Courses</CardTitle>
            <CardDescription>
              {courses.length} courses in the system
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">
                  Create New Course
                </DialogTitle>
                <DialogDescription>
                  Add a new course to the platform
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cname">Course Name</Label>
                  <Input
                    id="cname"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Introduction to AI"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ptype">Program Type</Label>
                  <Select value={programType} onValueChange={setProgramType}>
                    <SelectTrigger id="ptype">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Certificate">Certificate</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Degree">Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dur">Duration</Label>
                  <Input
                    id="dur"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 8 weeks"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="uni">University</Label>
                  <Select value={universityId} onValueChange={setUniversityId}>
                    <SelectTrigger id="uni">
                      <SelectValue placeholder="Select a university (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((u) => (
                        <SelectItem key={u.university_id} value={String(u.university_id)}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} disabled={loading || !name}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Course"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* Search bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by name..."
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Course Name</th>
                <th className="pb-3 pr-4 font-medium">Program</th>
                <th className="pb-3 pr-4 font-medium">Duration</th>
                <th className="pb-3 pr-4 font-medium">University</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCourses.map((c) => (
                <tr key={c.course_id}>
                  <td className="py-3 pr-4 font-medium text-foreground">
                    <Link href={`/admin/courses/${c.course_id}`} className="hover:underline text-primary">
                      {c.course_name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant="secondary">{c.program_type}</Badge>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{c.duration}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {universities.find(u => u.university_id === c.university_id)?.name || '—'}
                  </td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.course_id)} disabled={deleting === c.course_id}>
                      {deleting === c.course_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function AssignmentsTab({ instructors, courses, instructorCourses, universities }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Add instructor dialog state
  const [openAddInstructor, setOpenAddInstructor] = useState(false);
  const [addInstructorUsername, setAddInstructorUsername] = useState("");
  const [addInstructorPassword, setAddInstructorPassword] = useState("");
  const [addInstructorName, setAddInstructorName] = useState("");
  const [addInstructorContacts, setAddInstructorContacts] = useState("");
  const [addInstructorUniversityId, setAddInstructorUniversityId] = useState("");
  const [addInstructorLoading, setAddInstructorLoading] = useState(false);
  const [addInstructorError, setAddInstructorError] = useState("");
  const [addInstructorSuccess, setAddInstructorSuccess] = useState("");

  // Assign / remove inside popup
  const [assignCourseId, setAssignCourseId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(null);

  const router = useRouter();

  const filteredInstructors = instructors.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.contacts || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch courses when an instructor is selected
  useEffect(() => {
    async function fetchCourses() {
      if (!selectedInstructor) return setAssignedCourses([]);
      setLoadingCourses(true);
      try {
        const res = await fetch(`/api/instructor-course?instructorId=${selectedInstructor.instructor_id}`);
        if (res.ok) {
          const data = await res.json();
          setAssignedCourses(data.courses || []);
        }
      } finally {
        setLoadingCourses(false);
      }
    }
    fetchCourses();
  }, [selectedInstructor]);

  async function handleAddInstructor() {
    setAddInstructorLoading(true);
    setAddInstructorError("");
    setAddInstructorSuccess("");
    try {
      const res = await fetch("/api/instructor-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: addInstructorUsername,
          password: addInstructorPassword,
          name: addInstructorName,
          contacts: addInstructorContacts,
          universityId: addInstructorUniversityId || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddInstructorSuccess("Instructor added successfully!");
        setAddInstructorUsername("");
        setAddInstructorPassword("");
        setAddInstructorName("");
        setAddInstructorContacts("");
        setAddInstructorUniversityId("");
        setTimeout(() => {
          setOpenAddInstructor(false);
          setAddInstructorSuccess("");
          router.refresh();
        }, 1000);
      } else {
        setAddInstructorError(data.error || "Failed to add instructor");
      }
    } catch (e) {
      setAddInstructorError("Network or server error");
    } finally {
      setAddInstructorLoading(false);
    }
  }

  async function handleAssignCourse() {
    if (!selectedInstructor || !assignCourseId) return;
    setAssignLoading(true);
    try {
      const res = await fetch("/api/instructor-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId: selectedInstructor.instructor_id,
          courseId: Number(assignCourseId),
        }),
      });
      if (res.ok) {
        setAssignCourseId("");
        // Re-fetch assigned courses
        const res2 = await fetch(`/api/instructor-course?instructorId=${selectedInstructor.instructor_id}`);
        if (res2.ok) {
          const data = await res2.json();
          setAssignedCourses(data.courses || []);
        }
        router.refresh();
      }
    } finally {
      setAssignLoading(false);
    }
  }

  async function handleRemoveCourse(courseId) {
    setRemoveLoading(courseId);
    try {
      const res = await fetch(`/api/instructor-course?instructorId=${selectedInstructor.instructor_id}&courseId=${courseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAssignedCourses((prev) => prev.filter((c) => c.course_id !== courseId));
        router.refresh();
      }
    } finally {
      setRemoveLoading(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-serif">All Instructors</CardTitle>
            <CardDescription>{instructors.length} instructors in the system</CardDescription>
          </div>
          <Dialog open={openAddInstructor} onOpenChange={setOpenAddInstructor}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Instructor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Instructor</DialogTitle>
                <DialogDescription>Create a new system user for teaching.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                {addInstructorError && <div className="text-red-500 text-sm">{addInstructorError}</div>}
                {addInstructorSuccess && <div className="text-green-600 text-sm">{addInstructorSuccess}</div>}
                <div className="flex flex-col gap-2">
                  <Label>Username</Label>
                  <Input value={addInstructorUsername} onChange={e => setAddInstructorUsername(e.target.value)} placeholder="Username" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Password</Label>
                  <Input type="password" value={addInstructorPassword} onChange={e => setAddInstructorPassword(e.target.value)} placeholder="Password" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Full Name</Label>
                  <Input value={addInstructorName} onChange={e => setAddInstructorName(e.target.value)} placeholder="Name" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Contact Info</Label>
                  <Input value={addInstructorContacts} onChange={e => setAddInstructorContacts(e.target.value)} placeholder="Email/Phone" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>University</Label>
                  <Select value={addInstructorUniversityId} onValueChange={setAddInstructorUniversityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a university (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((u) => (
                        <SelectItem key={u.university_id} value={String(u.university_id)}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddInstructor} disabled={addInstructorLoading}>
                  {addInstructorLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Instructor"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* Search bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search instructors by name or contact..."
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Name</th>
                <th className="pb-3 pr-4 font-medium">Contact</th>
                <th className="pb-3 pr-4 font-medium">University</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInstructors.map((i) => (
                <tr key={i.instructor_id}>
                  <td className="py-3 pr-4 font-medium text-foreground">{i.name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{i.contacts || "—"}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {universities.find(u => u.university_id === i.university_id)?.name || "—"}
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInstructor(i)}
                    >
                      View Courses
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Per-instructor popup */}
        <Dialog open={!!selectedInstructor} onOpenChange={(open) => { if (!open) { setSelectedInstructor(null); setAssignCourseId(""); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif">{selectedInstructor?.name}</DialogTitle>
              <DialogDescription>
                {selectedInstructor?.contacts || "No contact info"}
                {selectedInstructor?.university_id
                  ? " • " + (universities.find(u => u.university_id === selectedInstructor.university_id)?.name || "")
                  : ""}
              </DialogDescription>
            </DialogHeader>

            {/* Assigned courses list */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-medium text-foreground">Assigned Courses</h4>
              {loadingCourses ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : assignedCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courses assigned yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {assignedCourses.map((c) => (
                    <div key={c.course_id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <span className="text-sm font-medium">{c.course_name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCourse(c.course_id)}
                        disabled={removeLoading === c.course_id}
                      >
                        {removeLoading === c.course_id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4 text-destructive" />}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Assign new course */}
              <div className="mt-2 flex items-end gap-2 rounded-lg border p-3">
                <div className="flex flex-1 flex-col gap-1">
                  <Label className="text-xs">Assign a Course</Label>
                  <Select value={assignCourseId} onValueChange={setAssignCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.course_id} value={String(c.course_id)}>
                          {c.course_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAssignCourse} disabled={assignLoading || !assignCourseId} size="sm">
                  {assignLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Link2 className="mr-1 h-3 w-3" />Assign</>}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function StudentsTab({ students }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Add student dialog state
  const [openAdd, setOpenAdd] = useState(false);
  const [addUsername, setAddUsername] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addFullName, setAddFullName] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  const router = useRouter();

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.city || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.country || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch enrolled courses when a student is selected
  useEffect(() => {
    async function fetchCourses() {
      if (!selectedStudent) return setEnrolledCourses([]);
      setLoadingCourses(true);
      try {
        const res = await fetch(`/api/students-courses?studentId=${selectedStudent.student_id}`);
        if (res.ok) {
          const data = await res.json();
          setEnrolledCourses(data.courses || []);
        }
      } finally {
        setLoadingCourses(false);
      }
    }
    fetchCourses();
  }, [selectedStudent]);

  async function handleAddStudent() {
    setAddLoading(true);
    setAddError("");
    setAddSuccess("");
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: addUsername,
          password: addPassword,
          name: addFullName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddSuccess("Student added successfully!");
        setAddUsername("");
        setAddPassword("");
        setAddFullName("");
        setTimeout(() => {
          setOpenAdd(false);
          setAddSuccess("");
          router.refresh();
        }, 1000);
      } else {
        setAddError(data.error || "Failed to add student");
      }
    } catch (e) {
      setAddError("Network error");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleDelete(studentId) {
    setDeleting(studentId);
    try {
      const res = await fetch(`/api/students?id=${studentId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  async function handleRemoveEnrollment(courseId) {
    setRemoveLoading(courseId);
    try {
      const res = await fetch(`/api/enroll?studentId=${selectedStudent.student_id}&courseId=${courseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEnrolledCourses((prev) => prev.filter((c) => c.course_id !== courseId));
        router.refresh();
      }
    } finally {
      setRemoveLoading(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-serif">All Students</CardTitle>
            <CardDescription>{students.length} students in the system</CardDescription>
          </div>
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Student</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Student Registration</DialogTitle>
                <DialogDescription>Register a new student with login credentials and a full name.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                {addError && <div className="text-red-500 text-sm">{addError}</div>}
                {addSuccess && <div className="text-green-600 text-sm">{addSuccess}</div>}
                <div className="flex flex-col gap-2">
                  <Label>Full Name</Label>
                  <Input value={addFullName} onChange={e => setAddFullName(e.target.value)} placeholder="e.g. John Doe" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Login Username</Label>
                  <Input value={addUsername} onChange={e => setAddUsername(e.target.value)} placeholder="username" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Password</Label>
                  <Input type="password" value={addPassword} onChange={e => setAddPassword(e.target.value)} placeholder="password" />
                </div>
                <Button onClick={handleAddStudent} disabled={addLoading || !addFullName || !addUsername || !addPassword}>
                  {addLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register Student"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {/* Search bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by name or location..."
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Name</th>
                <th className="pb-3 pr-4 font-medium">Level</th>
                <th className="pb-3 pr-4 font-medium">Location</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStudents.map((s) => (
                <tr key={s.student_id}>
                  <td className="py-3 pr-4 font-medium text-foreground">{s.name}</td>
                  <td className="py-3 pr-4"><Badge variant="secondary">{s.skill_level}</Badge></td>
                  <td className="py-3 pr-4 text-muted-foreground">{[s.city, s.country].filter(Boolean).join(", ")}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStudent(s)}
                      >
                        View Courses
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(s.student_id)} disabled={deleting === s.student_id}>
                        {deleting === s.student_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Per-student popup */}
        <Dialog open={!!selectedStudent} onOpenChange={(open) => { if (!open) setSelectedStudent(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif">{selectedStudent?.name}</DialogTitle>
              <DialogDescription>
                {selectedStudent?.skill_level || "No level set"}
                {selectedStudent?.city ? " • " + [selectedStudent.city, selectedStudent.country].filter(Boolean).join(", ") : ""}
              </DialogDescription>
            </DialogHeader>

            {/* Enrolled courses list */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-medium text-foreground">Enrolled Courses</h4>
              {loadingCourses ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : enrolledCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No approved enrollments.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {enrolledCourses.map((c) => (
                    <div key={c.course_id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <span className="text-sm font-medium">{c.course_name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEnrollment(c.course_id)}
                        disabled={removeLoading === c.course_id}
                      >
                        {removeLoading === c.course_id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4 text-destructive" />}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function UniversitiesTab({ universities }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const router = useRouter();

  async function handleDelete(universityId) {
    setDeleting(universityId);
    try {
      const res = await fetch(`/api/universities?id=${universityId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  async function handleCreate() {
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch("/api/universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location }),
      });
      if (res.ok) {
        setOpen(false);
        setName("");
        setLocation("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-serif">All Universities</CardTitle>
            <CardDescription>
              {universities.length} universities in the system
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New University
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif">
                  Add New University
                </DialogTitle>
                <DialogDescription>
                  Register a new university in the system
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="uniName">University Name</Label>
                  <Input
                    id="uniName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. MIT"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="uniLocation">Location</Label>
                  <Input
                    id="uniLocation"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Cambridge, MA"
                  />
                </div>
                <Button onClick={handleCreate} disabled={loading || !name}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Add University"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Name</th>
                <th className="pb-3 pr-4 font-medium">Location</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {universities.map((u) => (
                <tr key={u.university_id}>
                  <td className="py-3 pr-4 font-medium text-foreground">
                    {u.name}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {u.location || "—"}
                  </td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(u.university_id)} disabled={deleting === u.university_id}>
                      {deleting === u.university_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
