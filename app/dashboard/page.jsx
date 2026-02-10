import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudentDashboard } from "@/components/dashboards/student-dashboard";
import { InstructorDashboard } from "@/components/dashboards/instructor-dashboard";
import { AdminDashboard } from "@/components/dashboards/admin-dashboard";
import { AnalystDashboard } from "@/components/dashboards/analyst-dashboard";
import { sql } from "@/lib/db";

async function getStudentData(userId) {
  const studentRows = await sql`
    SELECT s.student_id, s.name, s.skill_level
    FROM student s WHERE s.user_id = ${userId}
  `;
  const student = studentRows[0];
  if (!student) return { student: null, enrollments: [], courses: [] };

  const enrollments = await sql`
    SELECT e.enroll_id, e.enroll_date, e.evaluation, e.approved, 
           c.course_id, c.course_name, c.program_type, c.duration, c.notes, c.video
    FROM enroll e
    JOIN course c ON e.course_id = c.course_id
    WHERE e.student_id = ${student.student_id}
    ORDER BY e.enroll_date DESC
  `;

  const courses = await sql`SELECT * FROM course ORDER BY course_name`;

  return { student, enrollments, courses };
}

async function getInstructorData(userId) {
  const instructorRows = await sql`
    SELECT i.instructor_id, i.name, i.contacts
    FROM instructor i WHERE i.user_id = ${userId}
  `;
  const instructor = instructorRows[0];
  if (!instructor) return { instructor: null, courses: [] };

  const courses = await sql`
    SELECT c.*
    FROM course c
    JOIN instructor_course ic ON c.course_id = ic.course_id
    WHERE ic.instructor_id = ${instructor.instructor_id}
    ORDER BY c.course_name
  `;

  return { instructor, courses };
}

async function getAdminData() {
  const courses = await sql`SELECT * FROM course ORDER BY course_name`;
  const students = await sql`
    SELECT s.*, u.username
    FROM student s
    LEFT JOIN app_user u ON s.user_id = u.id
    ORDER BY s.name
  `;
  const instructors = await sql`
    SELECT i.*, u.username
    FROM instructor i
    LEFT JOIN app_user u ON i.user_id = u.id
    ORDER BY i.name
  `;
  const instructorCourses = await sql`
    SELECT ic.*, i.name as instructor_name, c.course_name
    FROM instructor_course ic
    JOIN instructor i ON ic.instructor_id = i.instructor_id
    JOIN course c ON ic.course_id = c.course_id
  `;

  return { courses, students, instructors, instructorCourses };
}

async function getAnalystData() {
  const enrollmentStats = await sql`
    SELECT c.course_id, c.course_name, c.program_type,
      COUNT(e.enroll_id) as enrollment_count,
      ROUND(AVG(e.evaluation), 1) as avg_evaluation,
      MIN(e.evaluation) as min_evaluation,
      MAX(e.evaluation) as max_evaluation
    FROM course c
    LEFT JOIN enroll e ON c.course_id = e.course_id
    GROUP BY c.course_id, c.course_name, c.program_type
    ORDER BY enrollment_count DESC
  `;

  const performanceDistribution = await sql`
    SELECT
      CASE
        WHEN evaluation >= 90 THEN 'A (90-100)'
        WHEN evaluation >= 80 THEN 'B (80-89)'
        WHEN evaluation >= 70 THEN 'C (70-79)'
        WHEN evaluation >= 60 THEN 'D (60-69)'
        WHEN evaluation < 60 THEN 'F (0-59)'
        ELSE 'Not Graded'
      END as grade_range,
      COUNT(*) as count
    FROM enroll
    WHERE evaluation IS NOT NULL
    GROUP BY grade_range
    ORDER BY grade_range
  `;

  const totalStudents = await sql`SELECT COUNT(*) as count FROM student`;
  const totalCourses = await sql`SELECT COUNT(*) as count FROM course`;
  const totalEnrollments = await sql`SELECT COUNT(*) as count FROM enroll`;
  const avgEvaluation = await sql`SELECT ROUND(AVG(evaluation), 1) as avg FROM enroll WHERE evaluation IS NOT NULL`;

  return {
    enrollmentStats,
    performanceDistribution,
    summary: {
      totalStudents: totalStudents[0].count,
      totalCourses: totalCourses[0].count,
      totalEnrollments: totalEnrollments[0].count,
      avgEvaluation: avgEvaluation[0].avg,
    },
  };
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  switch (session.role) {
    case "student": {
      const data = await getStudentData(session.id);
      return <StudentDashboard user={session} data={data} />;
    }
    case "instructor": {
      const data = await getInstructorData(session.id);
      return <InstructorDashboard user={session} data={data} />;
    }
    case "admin": {
      const data = await getAdminData();
      return <AdminDashboard user={session} data={data} />;
    }
    case "analyst": {
      const data = await getAnalystData();
      return <AnalystDashboard user={session} />;
    }
    default:
      redirect("/");
  }
}
