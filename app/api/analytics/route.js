import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const programType = searchParams.get("programType") || null;
    const courseId = searchParams.get("courseId") || null;
    const startDate = searchParams.get("startDate") || null;
    const endDate = searchParams.get("endDate") || null;
    const view = searchParams.get("view") || "course";

    // --- Enrollment stats (course-wise) ---
    // Build dynamic query with tagged template workaround:
    // neon serverless doesn't support traditional parameterized dynamic WHERE,
    // so we use conditional filtering with coalesce-style approach
    const enrollmentStats = await sql`
      SELECT
        c.course_id,
        c.course_name,
        c.program_type,
        c.duration,
        COUNT(e.enroll_id) AS enrollment_count,
        ROUND(AVG(e.evaluation)::numeric, 2) AS avg_evaluation,
        MIN(e.evaluation) AS min_evaluation,
        MAX(e.evaluation) AS max_evaluation
      FROM course c
      LEFT JOIN enroll e ON c.course_id = e.course_id
      WHERE
        (${programType}::text IS NULL OR c.program_type = ${programType})
        AND (${courseId}::text IS NULL OR c.course_id = ${courseId}::int)
        AND (${startDate}::text IS NULL OR e.enroll_date >= ${startDate}::date)
        AND (${endDate}::text IS NULL OR e.enroll_date <= ${endDate}::date)
      GROUP BY c.course_id, c.course_name, c.program_type, c.duration
      ORDER BY enrollment_count DESC
    `;

    // --- Performance distribution ---
    const performanceDistribution = await sql`
      SELECT
        CASE
          WHEN e.evaluation >= 90 THEN 'A (90-100)'
          WHEN e.evaluation >= 80 THEN 'B (80-89)'
          WHEN e.evaluation >= 70 THEN 'C (70-79)'
          WHEN e.evaluation >= 60 THEN 'D (60-69)'
          ELSE 'F (<60)'
        END AS grade_range,
        COUNT(*) AS count
      FROM enroll e
      JOIN course c ON e.course_id = c.course_id
      WHERE e.evaluation IS NOT NULL
        AND (${programType}::text IS NULL OR c.program_type = ${programType})
        AND (${courseId}::text IS NULL OR c.course_id = ${courseId}::int)
        AND (${startDate}::text IS NULL OR e.enroll_date >= ${startDate}::date)
        AND (${endDate}::text IS NULL OR e.enroll_date <= ${endDate}::date)
      GROUP BY grade_range
      ORDER BY grade_range
    `;

    // --- Summary (global, unfiltered) ---
    const summaryRows = await sql`
      SELECT
        (SELECT COUNT(*) FROM course) AS total_courses,
        (SELECT COUNT(*) FROM student) AS total_students,
        (SELECT COUNT(*) FROM enroll) AS total_enrollments,
        (SELECT ROUND(AVG(evaluation)::numeric, 2) FROM enroll WHERE evaluation IS NOT NULL) AS avg_evaluation
    `;
    const summaryRow = summaryRows[0];

    // --- Student-wise stats (only if view=student) ---
    let studentStats = [];
    if (view === "student") {
      studentStats = await sql`
        SELECT
          s.student_id,
          s.name AS student_name,
          s.skill_level,
          s.city,
          s.country,
          COUNT(e.enroll_id) AS courses_enrolled,
          ROUND(AVG(e.evaluation)::numeric, 2) AS avg_grade,
          MIN(e.evaluation) AS min_grade,
          MAX(e.evaluation) AS max_grade
        FROM student s
        LEFT JOIN enroll e ON s.student_id = e.student_id
        LEFT JOIN course c ON e.course_id = c.course_id
        WHERE
          (${programType}::text IS NULL OR c.program_type = ${programType})
          AND (${courseId}::text IS NULL OR c.course_id = ${courseId}::int)
          AND (${startDate}::text IS NULL OR e.enroll_date >= ${startDate}::date)
          AND (${endDate}::text IS NULL OR e.enroll_date <= ${endDate}::date)
        GROUP BY s.student_id, s.name, s.skill_level, s.city, s.country
        ORDER BY avg_grade DESC NULLS LAST
      `;
    }

    // --- Program types list (for filter dropdown, replaces department) ---
    const programTypes = await sql`
      SELECT DISTINCT program_type FROM course WHERE program_type IS NOT NULL ORDER BY program_type
    `;

    // --- Courses list (for filter dropdown) ---
    const courses = await sql`
      SELECT course_id, course_name FROM course ORDER BY course_name
    `;

    return NextResponse.json({
      enrollmentStats,
      performanceDistribution,
      studentStats,
      summary: {
        totalCourses: Number(summaryRow.total_courses),
        totalStudents: Number(summaryRow.total_students),
        totalEnrollments: Number(summaryRow.total_enrollments),
        avgEvaluation: summaryRow.avg_evaluation
          ? Number(summaryRow.avg_evaluation)
          : null,
      },
      filters: {
        programTypes: programTypes.map((r) => r.program_type),
        courses,
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
