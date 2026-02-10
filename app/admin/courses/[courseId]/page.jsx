"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Save, X, Plus, BookOpen, User, Building2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

/* ── Combo Input ─────────────────────────────────────────────────────
   Text input with a filtered dropdown of existing suggestions.
   Typing filters the list; clicking a suggestion fills the input.
   If the typed value doesn't match anything, a new entry is created.
   ─────────────────────────────────────────────────────────────────── */
function ComboInput({ value, onChange, onAdd, suggestions, placeholder, adding }) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    const filtered = value
        ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()))
        : suggestions;

    // close dropdown on outside click
    useEffect(() => {
        function handleClick(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="relative flex-1" ref={wrapperRef}>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        value={value}
                        onChange={(e) => {
                            onChange(e.target.value);
                            setOpen(true);
                        }}
                        onFocus={() => setOpen(true)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                onAdd();
                                setOpen(false);
                            }
                        }}
                        placeholder={placeholder}
                    />
                    {open && filtered.length > 0 && (
                        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover shadow-md">
                            {filtered.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        onChange(item);
                                        setOpen(false);
                                    }}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <Button
                    size="sm"
                    onClick={() => {
                        onAdd();
                        setOpen(false);
                    }}
                    disabled={!value.trim() || adding}
                >
                    {adding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Plus className="mr-1 h-4 w-4" /> Add
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

/* ── Page ──────────────────────────────────────────────────────────── */
export default function AdminCourseDetailPage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.courseId;

    const [course, setCourse] = useState(null);
    const [universities, setUniversities] = useState([]);
    const [topics, setTopics] = useState([]);
    const [textbooks, setTextbooks] = useState([]);

    // All available items from DB
    const [allTopicNames, setAllTopicNames] = useState([]);
    const [allTextbooksFull, setAllTextbooksFull] = useState([]); // Store full objects

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    // Editable course fields
    const [courseName, setCourseName] = useState("");
    const [programType, setProgramType] = useState("");
    const [duration, setDuration] = useState("");
    const [universityId, setUniversityId] = useState("");

    // Add topic
    const [newTopicName, setNewTopicName] = useState("");
    const [addingTopic, setAddingTopic] = useState(false);
    const [removingTopicId, setRemovingTopicId] = useState(null);

    // Add textbook
    const [newBookName, setNewBookName] = useState("");
    const [newBookAuthor, setNewBookAuthor] = useState("");
    const [newBookPublication, setNewBookPublication] = useState("");
    const [addingBook, setAddingBook] = useState(false);
    const [removingBookId, setRemovingBookId] = useState(null);

    async function fetchCourseData() {
        try {
            const [courseRes, uniRes, topicsRes, booksRes] = await Promise.all([
                fetch(`/api/courses/${courseId}`),
                fetch("/api/universities"),
                fetch(`/api/courses/${courseId}/topics`),
                fetch(`/api/courses/${courseId}/textbooks`),
            ]);

            if (courseRes.ok) {
                const data = await courseRes.json();
                const c = data.course;
                setCourse(c);
                setCourseName(c.course_name || "");
                setProgramType(c.program_type || "");
                setDuration(c.duration || "");
                setUniversityId(c.university_id ? String(c.university_id) : "");
                setTopics(data.topics || []);
                setTextbooks(data.textbooks || []);
            } else {
                setError("Course not found");
            }
            if (uniRes.ok) setUniversities(await uniRes.json());
            if (topicsRes.ok) {
                const d = await topicsRes.json();
                setAllTopicNames((d.allTopics || []).map((t) => t.topic_name));
            }
            if (booksRes.ok) {
                const d = await booksRes.json();
                setAllTextbooksFull(d.allTextbooks || []);
            }
        } catch (e) {
            setError("Failed to load course data");
        }
    }

    useEffect(() => {
        setLoading(true);
        fetchCourseData().finally(() => setLoading(false));
    }, [courseId]);

    async function handleSave() {
        setSaving(true);
        setSaved(false);
        setError("");
        try {
            const res = await fetch(`/api/courses/${courseId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseName,
                    programType,
                    duration,
                    universityId: universityId || null,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setCourse(data.course);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to save");
            }
        } catch (e) {
            setError("Network error");
        } finally {
            setSaving(false);
        }
    }

    // Topic management
    async function handleAddTopic() {
        if (!newTopicName.trim()) return;
        setAddingTopic(true);
        try {
            const res = await fetch(`/api/courses/${courseId}/topics`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topicName: newTopicName.trim() }),
            });
            if (res.ok) {
                setNewTopicName("");
                await fetchCourseData();
            }
        } finally {
            setAddingTopic(false);
        }
    }

    async function handleRemoveTopic(topicId) {
        setRemovingTopicId(topicId);
        try {
            const res = await fetch(
                `/api/courses/${courseId}/topics?topicId=${topicId}`,
                { method: "DELETE" }
            );
            if (res.ok) await fetchCourseData();
        } finally {
            setRemovingTopicId(null);
        }
    }

    // Textbook management
    // Handle book name change -> auto-fill author/publisher if match found
    function handleBookNameChange(val) {
        setNewBookName(val);
        const match = allTextbooksFull.find(
            (b) => b.name.toLowerCase() === val.toLowerCase()
        );
        if (match) {
            setNewBookAuthor(match.author || "");
            setNewBookPublication(match.publication || "");
        }
    }

    async function handleAddBook() {
        if (!newBookName.trim()) return;
        setAddingBook(true);
        try {
            const res = await fetch(`/api/courses/${courseId}/textbooks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookName: newBookName.trim(),
                    author: newBookAuthor.trim(),
                    publication: newBookPublication.trim(),
                }),
            });
            if (res.ok) {
                setNewBookName("");
                setNewBookAuthor("");
                setNewBookPublication("");
                await fetchCourseData();
            }
        } finally {
            setAddingBook(false);
        }
    }

    async function handleRemoveBook(bookId) {
        setRemovingBookId(bookId);
        try {
            const res = await fetch(
                `/api/courses/${courseId}/textbooks?bookId=${bookId}`,
                { method: "DELETE" }
            );
            if (res.ok) await fetchCourseData();
        } finally {
            setRemovingBookId(null);
        }
    }

    // Derived suggestions
    const linkedTopicNames = new Set(topics.map((t) => t.topic_name));
    const topicSuggestions = allTopicNames.filter((n) => !linkedTopicNames.has(n));

    const linkedBookNames = new Set(textbooks.map((b) => b.name));
    const bookSuggestions = allTextbooksFull
        .map((b) => b.name)
        .filter((n) => !linkedBookNames.has(n));

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error && !course) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl p-6 sm:p-10">
            <Button
                variant="ghost"
                size="sm"
                className="mb-6"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>

            {/* ── Course Details ── */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-serif">Edit Course</CardTitle>
                            <CardDescription>Update course details</CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            ID: {course?.course_id}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="courseName">Course Name</Label>
                            <Input
                                id="courseName"
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                placeholder="e.g. Introduction to AI"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="programType">Program Type</Label>
                                <Select value={programType} onValueChange={setProgramType}>
                                    <SelectTrigger id="programType">
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
                                <Label htmlFor="duration">Duration</Label>
                                <Input
                                    id="duration"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="e.g. 8 weeks"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="university">University</Label>
                            <Select value={universityId} onValueChange={setUniversityId}>
                                <SelectTrigger id="university">
                                    <SelectValue placeholder="Select a university (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {universities.map((u) => (
                                        <SelectItem
                                            key={u.university_id}
                                            value={String(u.university_id)}
                                        >
                                            {u.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Topics ── */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base font-serif">Topics</CardTitle>
                    <CardDescription>
                        Add existing or new topics to this course
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {topics.length === 0 ? (
                        <p className="mb-4 text-sm text-muted-foreground">
                            No topics assigned yet.
                        </p>
                    ) : (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {topics.map((t) => (
                                <Badge
                                    key={t.topic_id}
                                    variant="secondary"
                                    className="flex items-center gap-1 pr-1"
                                >
                                    {t.topic_name}
                                    <button
                                        onClick={() => handleRemoveTopic(t.topic_id)}
                                        disabled={removingTopicId === t.topic_id}
                                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                                    >
                                        {removingTopicId === t.topic_id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <X className="h-3 w-3" />
                                        )}
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                    <ComboInput
                        value={newTopicName}
                        onChange={setNewTopicName}
                        onAdd={handleAddTopic}
                        suggestions={topicSuggestions}
                        placeholder="Search or add topic..."
                        adding={addingTopic}
                    />
                </CardContent>
            </Card>

            {/* ── Textbooks ── */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base font-serif">Textbooks</CardTitle>
                    <CardDescription>
                        Add existing or new textbooks to this course
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {textbooks.length === 0 ? (
                        <p className="mb-4 text-sm text-muted-foreground">
                            No textbooks assigned yet.
                        </p>
                    ) : (
                        <div className="mb-4 flex flex-col gap-2">
                            {textbooks.map((b) => (
                                <div
                                    key={b.book_id}
                                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                                >
                                    <div>
                                        <span className="text-sm font-medium">{b.name}</span>
                                        {(b.author || b.publication) && (
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                {[b.author, b.publication]
                                                    .filter(Boolean)
                                                    .join(" • ")}
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveBook(b.book_id)}
                                        disabled={removingBookId === b.book_id}
                                    >
                                        {removingBookId === b.book_id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <X className="h-4 w-4 text-destructive" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Textbook Form */}
                    <div className="rounded-lg bg-muted/40 p-3 border">
                        <div className="flex flex-col gap-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Add New Textbook</Label>
                            <ComboInput
                                value={newBookName}
                                onChange={handleBookNameChange}
                                onAdd={handleAddBook}
                                suggestions={bookSuggestions}
                                placeholder="Book Name (search or create)"
                                adding={addingBook}
                            />
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div className="relative">
                                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={newBookAuthor}
                                        onChange={e => setNewBookAuthor(e.target.value)}
                                        placeholder="Author"
                                        className="pl-9 h-9"
                                    />
                                </div>
                                <div className="relative">
                                    <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={newBookPublication}
                                        onChange={e => setNewBookPublication(e.target.value)}
                                        placeholder="Publication"
                                        className="pl-9 h-9"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Save Changes (bottom) ── */}
            {error && <div className="mb-2 text-sm text-destructive">{error}</div>}
            {saved && (
                <div className="mb-2 text-sm text-green-600">
                    Changes saved successfully!
                </div>
            )}
            <Button
                className="w-full"
                onClick={handleSave}
                disabled={saving || !courseName}
            >
                {saving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </>
                )}
            </Button>
        </div>
    );
}
