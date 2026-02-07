"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

const sectionToTab = {
  "admin-courses": "courses",
  "admin-assignments": "assignments",
  "admin-students": "students",
};

export function AdminDashboard({ user, data }) {
  const { courses, students, instructors, instructorCourses } = data;
  const [activeTab, setActiveTab] = useState("courses");

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-4">
          <CoursesTab courses={courses} />
        </TabsContent>
        <TabsContent value="assignments" className="mt-4">
          <AssignmentsTab
            instructors={instructors}
            courses={courses}
            instructorCourses={instructorCourses}
          />
        </TabsContent>
        <TabsContent value="students" className="mt-4">
          <StudentsTab students={students} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CoursesTab({ courses }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [programType, setProgramType] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        }),
      });
      if (res.ok) {
        setOpen(false);
        setName("");
        setProgramType("");
        setDuration("");
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
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">ID</th>
                <th className="pb-3 pr-4 font-medium">Course Name</th>
                <th className="pb-3 pr-4 font-medium">Program</th>
                <th className="pb-3 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {courses.map((c) => (
                <tr key={c.course_id}>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {c.course_id}
                  </td>
                  <td className="py-3 pr-4 font-medium text-foreground">
                    {c.course_name}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant="secondary">{c.program_type}</Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">{c.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function AssignmentsTab({ instructors, courses, instructorCourses }) {
  const [openAddInstructor, setOpenAddInstructor] = useState(false);
  const [addInstructorUsername, setAddInstructorUsername] = useState("");
  const [addInstructorPassword, setAddInstructorPassword] = useState("");
  const [addInstructorName, setAddInstructorName] = useState("");
  const [addInstructorContacts, setAddInstructorContacts] = useState("");
  const [addInstructorLoading, setAddInstructorLoading] = useState(false);
  const [addInstructorError, setAddInstructorError] = useState("");
  const [addInstructorSuccess, setAddInstructorSuccess] = useState("");

  const [openRemoveInstructor, setOpenRemoveInstructor] = useState(false);
  const [removeInstructorId, setRemoveInstructorId] = useState("");
  const [removeInstructorCourses, setRemoveInstructorCourses] = useState([]);
  const [removeInstructorCourseId, setRemoveInstructorCourseId] = useState("");
  const [removeInstructorLoading, setRemoveInstructorLoading] = useState(false);

  const [instructorId, setInstructorId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddInstructorSuccess("Instructor added successfully!");
        setAddInstructorUsername("");
        setAddInstructorPassword("");
        setAddInstructorName("");
        setAddInstructorContacts("");
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

  async function handleRemoveInstructorFromCourse() {
    setRemoveInstructorLoading(true);
    try {
      const res = await fetch(`/api/instructor-course?instructorId=${removeInstructorId}&courseId=${removeInstructorCourseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOpenRemoveInstructor(false);
        setRemoveInstructorId("");
        setRemoveInstructorCourseId("");
        setRemoveInstructorCourses([]);
        router.refresh();
      }
    } finally {
      setRemoveInstructorLoading(false);
    }
  }

  useEffect(() => {
    async function fetchCourses() {
      if (!removeInstructorId) return setRemoveInstructorCourses([]);
      const res = await fetch(`/api/instructor-course?instructorId=${removeInstructorId}`);
      if (res.ok) {
        const data = await res.json();
        setRemoveInstructorCourses(data.courses || []);
      } else {
        setRemoveInstructorCourses([]);
      }
    }
    fetchCourses();
  }, [removeInstructorId]);

  async function handleAssign() {
    if (!instructorId || !courseId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/instructor-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId: Number(instructorId),
          courseId: Number(courseId),
        }),
      });
      if (res.ok) {
        setInstructorId("");
        setCourseId("");
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
            <CardTitle className="text-base font-serif">Instructor Assignments</CardTitle>
            <CardDescription>Assign or create instructors</CardDescription>
          </div>
          <div className="flex gap-2">
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
                  <Button onClick={handleAddInstructor} disabled={addInstructorLoading}>
                    {addInstructorLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Instructor"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={openRemoveInstructor} onOpenChange={setOpenRemoveInstructor}>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                  <Trash2 className="mr-2 h-4 w-4" /> Remove Assignment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Unassign Instructor</DialogTitle>
                  <DialogDescription>Remove teaching relationship.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Instructor</Label>
                    <Select value={removeInstructorId} onValueChange={setRemoveInstructorId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructors.map(i => (
                          <SelectItem key={i.instructor_id} value={String(i.instructor_id)}>{i.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Course</Label>
                    <Select value={removeInstructorCourseId} onValueChange={setRemoveInstructorCourseId} disabled={!removeInstructorCourses.length}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {removeInstructorCourses.map(c => (
                          <SelectItem key={c.course_id} value={String(c.course_id)}>{c.course_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleRemoveInstructorFromCourse} disabled={removeInstructorLoading}>
                    {removeInstructorLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove from Course"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-2">
            <Label>Instructor</Label>
            <Select value={instructorId} onValueChange={setInstructorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select instructor" />
              </SelectTrigger>
              <SelectContent>
                {instructors.map((i) => (
                  <SelectItem key={i.instructor_id} value={String(i.instructor_id)}>
                    {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label>Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
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
          <Button onClick={handleAssign} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Link2 className="mr-2 h-4 w-4" />Assign</>}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Instructor</th>
                <th className="pb-3 font-medium">Course</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {instructorCourses.map((ic, idx) => (
                <tr key={idx}>
                  <td className="py-3 pr-4 font-medium text-foreground">{ic.instructor_name}</td>
                  <td className="py-3 text-muted-foreground">{ic.course_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function StudentsTab({ students }) {
  const [deleting, setDeleting] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);
  
  // Updated state to include Full Name
  const [addUsername, setAddUsername] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addFullName, setAddFullName] = useState("");
  
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [removeStudentId, setRemoveStudentId] = useState("");
  const [removeCourses, setRemoveCourses] = useState([]);
  const [removeCourseId, setRemoveCourseId] = useState("");
  const [removeLoading, setRemoveLoading] = useState(false);
  const router = useRouter();

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
          name: addFullName // Passing the new Full Name field
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddSuccess("Student added successfully!");
        setAddUsername("");
        setAddPassword("");
        setAddFullName(""); // Clear Full Name
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

  async function handleDeleteFromCourse() {
    setRemoveLoading(true);
    try {
      const res = await fetch(`/api/enroll?studentId=${removeStudentId}&courseId=${removeCourseId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setOpenRemove(false);
        setRemoveStudentId("");
        setRemoveCourseId("");
        setRemoveCourses([]);
        router.refresh();
      }
    } finally {
      setRemoveLoading(false);
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

  useEffect(() => {
    async function fetchCourses() {
      if (!removeStudentId) return setRemoveCourses([]);
      const res = await fetch(`/api/students-courses?studentId=${removeStudentId}`);
      if (res.ok) {
        const data = await res.json();
        setRemoveCourses(data.courses || []);
      } else {
        setRemoveCourses([]);
      }
    }
    fetchCourses();
  }, [removeStudentId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-serif">All Students</CardTitle>
            <CardDescription>{students.length} students enrolled</CardDescription>
          </div>
          <div className="flex gap-2">
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
            <Dialog open={openRemove} onOpenChange={setOpenRemove}>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary"><Trash2 className="mr-2 h-4 w-4" /> Remove Enrollment</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Remove from Course</DialogTitle></DialogHeader>
                <div className="flex flex-col gap-4">
                  <Label>Student</Label>
                  <Select value={removeStudentId} onValueChange={setRemoveStudentId}>
                    <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                    <SelectContent>
                      {students.map(s => <SelectItem key={s.student_id} value={String(s.student_id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Label>Course</Label>
                  <Select value={removeCourseId} onValueChange={setRemoveCourseId} disabled={!removeCourses.length}>
                    <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>
                      {removeCourses.map(c => <SelectItem key={c.course_id} value={String(c.course_id)}>{c.course_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleDeleteFromCourse} disabled={removeLoading}>Unenroll</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3">Name</th>
                <th className="pb-3">Level</th>
                <th className="pb-3">Location</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((s) => (
                <tr key={s.student_id}>
                  <td className="py-3 font-medium">{s.name}</td>
                  <td className="py-3"><Badge variant="secondary">{s.skill_level}</Badge></td>
                  <td className="py-3 text-muted-foreground">{[s.city, s.country].filter(Boolean).join(", ")}</td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(s.student_id)} disabled={deleting === s.student_id}>
                      {deleting === s.student_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
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
