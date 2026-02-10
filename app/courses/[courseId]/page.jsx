import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Video, FileText } from "lucide-react";

async function getCourseData(courseId, userId) {
    // Get student info
    const studentRows = await sql`
    SELECT student_id FROM student WHERE user_id = ${userId}
  `;

    if (studentRows.length === 0) {
        return { authorized: false, student: null, course: null, enrollment: null, topics: [] };
    }

    const student = studentRows[0];

    // Check enrollment
    const enrollmentRows = await sql`
    SELECT e.enroll_id, e.enroll_date, e.evaluation, e.approved
    FROM enroll e
    WHERE e.course_id = ${courseId} AND e.student_id = ${student.student_id}
  `;

    // Only allow access if enrolled and approved
    if (enrollmentRows.length === 0 || !enrollmentRows[0].approved) {
        return { authorized: false, student, course: null, enrollment: null, topics: [] };
    }

    const enrollment = enrollmentRows[0];

    // Get course details
    const courseRows = await sql`
    SELECT * FROM course WHERE course_id = ${courseId}
  `;

    if (courseRows.length === 0) {
        return { authorized: false, student, course: null, enrollment, topics: [] };
    }

    const course = courseRows[0];

    // Get course topics
    const topics = await sql`
    SELECT t.topic_id, t.topic_name
    FROM course_topic t
    JOIN course_topic_link l ON t.topic_id = l.topic_id
    WHERE l.course_id = ${courseId}
    ORDER BY t.topic_name
  `;

    return { authorized: true, student, course, enrollment, topics };
}

export default async function CoursePage({ params }) {
    const session = await getSession();

    if (!session || session.role !== 'student') {
        redirect("/");
    }

    // In Next.js 16, params is a Promise
    const { courseId } = await params;
    const data = await getCourseData(parseInt(courseId), session.id);

    if (!data.authorized) {
        redirect("/dashboard");
    }

    const { course, enrollment, topics } = data;

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                    <a href="/dashboard" className="text-sm text-primary hover:underline">
                        ← Back to Dashboard
                    </a>
                </div>
                <h1 className="text-3xl font-bold text-foreground font-serif mb-2">
                    {course.course_name}
                </h1>
                <div className="flex items-center gap-3">
                    <Badge variant="secondary">{course.program_type}</Badge>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                    </span>
                    {enrollment.evaluation !== null && (
                        <Badge variant={enrollment.evaluation >= 70 ? "default" : "destructive"}>
                            Grade: {enrollment.evaluation}/100
                        </Badge>
                    )}
                </div>
            </div>

            {/* Course Content */}
            <div className="grid gap-6">
                {/* Notes Section */}
                {course.notes && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <CardTitle className="font-serif">Course Notes</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground whitespace-pre-wrap">{course.notes}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Video Section */}
                {course.video && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Video className="h-5 w-5 text-primary" />
                                <CardTitle className="font-serif">Video Resources</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <a
                                href={course.video}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                {course.video}
                            </a>
                        </CardContent>
                    </Card>
                )}

                {/* Topics Section */}
                {topics.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                <CardTitle className="font-serif">Course Topics</CardTitle>
                            </div>
                            <CardDescription>
                                Topics covered in this course
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {topics.map((topic) => (
                                    <li
                                        key={topic.topic_id}
                                        className="flex items-center gap-2 text-foreground"
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        {topic.topic_name}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Enrollment Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-serif">Enrollment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Enrolled Date:</span>
                                <span className="font-medium">
                                    {enrollment.enroll_date
                                        ? new Date(enrollment.enroll_date).toLocaleDateString()
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant="default">Enrolled</Badge>
                            </div>
                            {enrollment.evaluation !== null && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Evaluation:</span>
                                    <span className="font-medium">{enrollment.evaluation}/100</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
