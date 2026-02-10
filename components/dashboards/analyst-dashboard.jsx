"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, UserPlus, Plus, Trash2, Loader2, Link2, School } from "lucide-react";

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
    if (tab) setActiveTab(tab);
  }, []);

  useEffect(() => {
    window.addEventListener("quadbase:navigate", handleNavEvent);
    return () => window.removeEventListener("quadbase:navigate", handleNavEvent);
  }, [handleNavEvent]);

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div id="dashboard">
        <h1 className="text-2xl font-bold text-foreground font-serif">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage platform entities and relationships</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard icon={<BookOpen className="h-5 w-5 text-primary" />} label="Courses" count={courses.length} />
        <StatCard icon={<Users className="h-5 w-5 text-accent-foreground" />} label="Instructors" count={instructors.length} bgColor="bg-accent/20" />
        <StatCard icon={<School className="h-5 w-5 text-orange-500" />} label="Universities" count={universities.length} bgColor="bg-orange-100" />
        <StatCard icon={<UserPlus className="h-5 w-5 text-chart-3" />} label="Students" count={students.length} bgColor="bg-chart-3/10" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="universities">Universities</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-4"><CoursesTab courses={courses} universities={universities} /></TabsContent>
        <TabsContent value="assignments" className="mt-4"><AssignmentsTab instructors={instructors} courses={courses} instructorCourses={instructorCourses} universities={universities} /></TabsContent>
        <TabsContent value="universities" className="mt-4"><UniversitiesTab universities={universities} /></TabsContent>
        <TabsContent value="students" className="mt-4"><StudentsTab students={students} /></TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon, label, count, bgColor = "bg-primary/10" }) {
  return (
    <Card><CardContent className="flex items-center gap-4 p-4"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColor}`}>{icon}</div><div><p className="text-2xl font-bold">{count}</p><p className="text-sm text-muted-foreground">{label}</p></div></CardContent></Card>
  );
}

function UniversitiesTab({ universities }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch("/api/universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location }),
      });
      if (res.ok) { setOpen(false); setName(""); setLocation(""); router.refresh(); }
    } finally { setLoading(false); }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle>Universities</CardTitle><CardDescription>Manage partnering institutions</CardDescription></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add University</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New University</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Label>University Name</Label><Input value={name} onChange={e => setName(e.target.value)} />
              <Label>Location</Label><Input value={location} onChange={e => setLocation(e.target.value)} />
              <Button onClick={handleCreate} disabled={loading}>{loading ? "Adding..." : "Add University"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="pb-3">ID</th><th className="pb-3">Name</th><th className="pb-3">Location</th></tr></thead>
          <tbody className="divide-y">
            {universities.map(u => (<tr key={u.university_id}><td className="py-3">{u.university_id}</td><td className="py-3 font-medium">{u.name}</td><td className="py-3 text-muted-foreground">{u.location}</td></tr>))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function CoursesTab({ courses, universities }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [programType, setProgramType] = useState("");
  const [duration, setDuration] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseName: name, programType, duration, universityId }),
      });
      if (res.ok) { setOpen(false); setName(""); setUniversityId(""); router.refresh(); }
    } finally { setLoading(false); }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle>All Courses</CardTitle></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> New Course</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Course</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Label>Course Name</Label><Input value={name} onChange={e => setName(e.target.value)} />
              <Label>University (Offered By)</Label>
              <Select value={universityId} onValueChange={setUniversityId}>
                <SelectTrigger><SelectValue placeholder="Select University" /></SelectTrigger>
                <SelectContent>{universities.map(u => <SelectItem key={u.university_id} value={String(u.university_id)}>{u.name}</SelectItem>)}</SelectContent>
              </Select>
              <Label>Program Type</Label>
              <Select value={programType} onValueChange={setProgramType}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent><SelectItem value="Certificate">Certificate</SelectItem><SelectItem value="Degree">Degree</SelectItem></SelectContent>
              </Select>
              <Label>Duration</Label><Input value={duration} onChange={e => setDuration(e.target.value)} />
              <Button onClick={handleCreate} disabled={loading || !name}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th>ID</th><th>Name</th><th>Duration</th></tr></thead>
          <tbody className="divide-y">{courses.map(c => (<tr key={c.course_id}><td className="py-3">{c.course_id}</td><td className="py-3 font-medium">{c.course_name}</td><td className="py-3 text-muted-foreground">{c.duration}</td></tr>))}</tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function AssignmentsTab({ instructors, courses, instructorCourses, universities }) {
  const [openAddInstructor, setOpenAddInstructor] = useState(false);
  const [addInstructorUsername, setAddInstructorUsername] = useState("");
  const [addInstructorPassword, setAddInstructorPassword] = useState("");
  const [addInstructorName, setAddInstructorName] = useState("");
  const [addInstructorContacts, setAddInstructorContacts] = useState("");
  const [addInstructorUniId, setAddInstructorUniId] = useState("");
  const [addInstructorLoading, setAddInstructorLoading] = useState(false);
  const [addInstructorError, setAddInstructorError] = useState("");
  const [addInstructorSuccess, setAddInstructorSuccess] = useState("");

  const [instructorId, setInstructorId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAddInstructor() {
    setAddInstructorLoading(true);
    try {
      const res = await fetch("/api/instructor-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            username: addInstructorUsername, 
            password: addInstructorPassword, 
            name: addInstructorName, 
            contacts: addInstructorContacts,
            universityId: addInstructorUniId 
        }),
      });
      if (res.ok) { setOpenAddInstructor(false); router.refresh(); }
    } finally { setAddInstructorLoading(false); }
  }

  async function handleAssign() {
    if (!instructorId || !courseId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/instructor-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId: Number(instructorId), courseId: Number(courseId) }),
      });
      if (res.ok) { setInstructorId(""); setCourseId(""); router.refresh(); }
    } finally { setLoading(false); }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div><CardTitle>Instructor Management</CardTitle></div>
        <Dialog open={openAddInstructor} onOpenChange={setOpenAddInstructor}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Instructor</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Instructor</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Label>Full Name</Label><Input value={addInstructorName} onChange={e => setAddInstructorName(e.target.value)} />
              <Label>University (Teaches At)</Label>
              <Select value={addInstructorUniId} onValueChange={setAddInstructorUniId}>
                <SelectTrigger><SelectValue placeholder="Select University" /></SelectTrigger>
                <SelectContent>{universities.map(u => <SelectItem key={u.university_id} value={String(u.university_id)}>{u.name}</SelectItem>)}</SelectContent>
              </Select>
              <Label>Username</Label><Input value={addInstructorUsername} onChange={e => setAddInstructorUsername(e.target.value)} />
              <Label>Password</Label><Input type="password" value={addInstructorPassword} onChange={e => setAddInstructorPassword(e.target.value)} />
              <Button onClick={handleAddInstructor} disabled={addInstructorLoading}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4 items-end rounded-lg border p-4">
          <div className="flex-1"><Label>Instructor</Label><Select value={instructorId} onValueChange={setInstructorId}><SelectTrigger><SelectValue placeholder="Instructor" /></SelectTrigger><SelectContent>{instructors.map(i => <SelectItem key={i.instructor_id} value={String(i.instructor_id)}>{i.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="flex-1"><Label>Course</Label><Select value={courseId} onValueChange={setCourseId}><SelectTrigger><SelectValue placeholder="Course" /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.course_id} value={String(c.course_id)}>{c.course_name}</SelectItem>)}</SelectContent></Select></div>
          <Button onClick={handleAssign} disabled={loading}><Link2 className="mr-2 h-4 w-4" />Assign</Button>
        </div>
        <table className="w-full text-sm"><thead><tr className="border-b text-left"><th>Instructor</th><th>Course</th></tr></thead><tbody className="divide-y">{instructorCourses.map((ic, i) => (<tr key={i}><td className="py-3">{ic.instructor_name}</td><td className="py-3">{ic.course_name}</td></tr>))}</tbody></table>
      </CardContent>
    </Card>
  );
}

function StudentsTab({ students }) {
  const [deleting, setDeleting] = useState(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [addUsername, setAddUsername] = useState("");
  const [addFullName, setAddFullName] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const router = useRouter();

  async function handleAddStudent() {
    setAddLoading(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: addUsername, password: addPassword, name: addFullName }),
      });
      if (res.ok) { setOpenAdd(false); setAddFullName(""); setAddUsername(""); router.refresh(); }
    } finally { setAddLoading(false); }
  }

  async function handleDelete(id) {
    setDeleting(id);
    try { await fetch(`/api/students?id=${id}`, { method: "DELETE" }); router.refresh(); } finally { setDeleting(null); }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Students</CardTitle>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Student</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Student</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Label>Full Name</Label><Input value={addFullName} onChange={e => setAddFullName(e.target.value)} />
              <Label>Username</Label><Input value={addUsername} onChange={e => setAddUsername(e.target.value)} />
              <Label>Password</Label><Input type="password" value={addPassword} onChange={e => setAddPassword(e.target.value)} />
              <Button onClick={handleAddStudent} disabled={addLoading}>Register</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th>Name</th><th>Action</th></tr></thead>
          <tbody className="divide-y">{students.map(s => (<tr key={s.student_id}><td className="py-3 font-medium">{s.name}</td><td><Button variant="ghost" onClick={() => handleDelete(s.student_id)}>{deleting === s.student_id ? <Loader2 className="animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}</Button></td></tr>))}</tbody>
        </table>
      </CardContent>
    </Card>
  );
}