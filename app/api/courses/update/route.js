import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PUT(request) {
  const payload = await request.json();
  const { courseId } = payload;

  if (!courseId) {
    return NextResponse.json(
      { error: "courseId is required" },
      { status: 400 },
    );
  }

  const allowedProgramTypes = ["professional", "certificate", "degree"];
  let { programType, duration, notes, video } = payload;

  // Validate and normalize programType
  if (payload.hasOwnProperty("programType")) {
    if (typeof programType !== "string") {
      return NextResponse.json(
        { error: "programType must be a string" },
        { status: 400 },
      );
    }
    const pLower = programType.trim().toLowerCase();
    if (!allowedProgramTypes.includes(pLower)) {
      return NextResponse.json(
        {
          error: "programType must be one of professional, certificate, degree",
        },
        { status: 400 },
      );
    }
    programType = pLower.charAt(0).toUpperCase() + pLower.slice(1);
  }

  // Validate and normalize duration
  if (payload.hasOwnProperty("duration")) {
    if (typeof duration !== "string" && typeof duration !== "number") {
      return NextResponse.json(
        { error: "duration must be a string or number like '8 weeks' or 8" },
        { status: 400 },
      );
    }
    let durStr = String(duration).trim();
    const numOnly = /^(\d+)$/;
    const unitPattern = /^(\d+)\s*(weeks?|months?|years?)$/i;
    if (numOnly.test(durStr)) {
      durStr = `${durStr} weeks`;
    } else {
      const m = durStr.match(unitPattern);
      if (!m) {
        return NextResponse.json(
          {
            error:
              "duration must be a number optionally followed by unit: weeks, months, years (e.g. '8 weeks')",
          },
          { status: 400 },
        );
      }
      durStr = `${m[1]} ${m[2].toLowerCase()}`;
    }
    duration = durStr;
  }

  try {
    // Build update conditionally
    if (
      payload.hasOwnProperty("notes") &&
      payload.hasOwnProperty("video") &&
      payload.hasOwnProperty("programType") &&
      payload.hasOwnProperty("duration")
    ) {
      await sql`
        UPDATE course
        SET notes = ${notes ?? null},
            video = ${video ?? null},
            program_type = ${programType ?? null},
            duration = ${duration ?? null}
        WHERE course_id = ${courseId}
      `;
    } else if (
      payload.hasOwnProperty("notes") &&
      payload.hasOwnProperty("video") &&
      payload.hasOwnProperty("programType")
    ) {
      await sql`
        UPDATE course
        SET notes = ${notes ?? null},
            video = ${video ?? null},
            program_type = ${programType ?? null}
        WHERE course_id = ${courseId}
      `;
    } else if (
      payload.hasOwnProperty("notes") &&
      payload.hasOwnProperty("video") &&
      payload.hasOwnProperty("duration")
    ) {
      await sql`
        UPDATE course
        SET notes = ${notes ?? null},
            video = ${video ?? null},
            duration = ${duration ?? null}
        WHERE course_id = ${courseId}
      `;
    } else if (
      payload.hasOwnProperty("notes") &&
      payload.hasOwnProperty("programType") &&
      payload.hasOwnProperty("duration")
    ) {
      await sql`
        UPDATE course
        SET notes = ${notes ?? null},
            program_type = ${programType ?? null},
            duration = ${duration ?? null}
        WHERE course_id = ${courseId}
      `;
    } else if (
      payload.hasOwnProperty("video") &&
      payload.hasOwnProperty("programType") &&
      payload.hasOwnProperty("duration")
    ) {
      await sql`
        UPDATE course
        SET video = ${video ?? null},
            program_type = ${programType ?? null},
            duration = ${duration ?? null}
        WHERE course_id = ${courseId}
      `;
    } else if (
      payload.hasOwnProperty("notes") &&
      payload.hasOwnProperty("video")
    ) {
      await sql`
        UPDATE course
        SET notes = ${notes ?? null},
            video = ${video ?? null}
        WHERE course_id = ${courseId}
      `;
    } else if (
      payload.hasOwnProperty("notes") &&
      payload.hasOwnProperty("programType")
    ) {
      await sql`
        UPDATE course
        SET notes = ${notes ?? null},
            program_type = ${programType ?? null}
        WHERE course_id = ${courseId}
      `;
    } else if (
      payload.hasOwnProperty("notes") &&
      payload.hasOwnProperty("duration")
    ) {
      await sql`
        UPDATE course
        SET notes = ${notes ?? null},
            duration = ${duration ?? null}
        WHERE course_id = ${courseId}
      `;
    } else if (
      payload.hasOwnProperty("video") &&
      payload.hasOwnProperty("programType")
    ) {
      await sql`
        UPDATE course
        SET video = ${video ?? null},
            program_type = ${programType ?? null}
        WHERE course_id = ${courseId}
      `;
    } else if (
      payload.hasOwnProperty("video") &&
      payload.hasOwnProperty("duration")
    ) {
      await sql`
        UPDATE course
        SET video = ${video ?? null},
            duration = ${duration ?? null}
        WHERE course_id = ${courseId}
      `;
    } else if (
      payload.hasOwnProperty("programType") &&
      payload.hasOwnProperty("duration")
    ) {
      await sql`
        UPDATE course
        SET program_type = ${programType ?? null},
            duration = ${duration ?? null}
        WHERE course_id = ${courseId}
      `;
    } else if (payload.hasOwnProperty("notes")) {
      await sql`
        UPDATE course
        SET notes = ${notes ?? null}
        WHERE course_id = ${courseId}
      `;
    } else if (payload.hasOwnProperty("video")) {
      await sql`
        UPDATE course
        SET video = ${video ?? null}
        WHERE course_id = ${courseId}
      `;
    } else if (payload.hasOwnProperty("programType")) {
      await sql`
        UPDATE course
        SET program_type = ${programType ?? null}
        WHERE course_id = ${courseId}
      `;
    } else if (payload.hasOwnProperty("duration")) {
      await sql`
        UPDATE course
        SET duration = ${duration ?? null}
        WHERE course_id = ${courseId}
      `;
    } else {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update course error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update course";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
