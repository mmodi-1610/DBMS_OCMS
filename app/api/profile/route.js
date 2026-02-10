import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function PUT(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['student', 'instructor'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const role = body.role

  try {
    if (role === 'student') {
      await sql`
        UPDATE student
        SET name = ${body.name}, skill_level = ${body.skill_level || null}, city = ${body.city || null}, state = ${body.state || null}, country = ${body.country || null}, dob = ${body.dob || null}
        WHERE user_id = ${session.id}
      `
      return NextResponse.json({ success: true })
    }

    if (role === 'instructor') {
      await sql`
        UPDATE instructor
        SET name = ${body.name}, contacts = ${body.contacts || null}
        WHERE user_id = ${session.id}
      `
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update profile'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { role } = body

  if (role !== session.role || !['student', 'instructor'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Server-side validation: name is required (NOT NULL)
  const name = (body.name || '').trim()
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (name.length > 200) {
    return NextResponse.json({ error: 'Name must be 200 characters or fewer' }, { status: 400 })
  }

  if (role === 'student') {
    const { dob, skill_level, city, state, country } = body

    // Enforce VARCHAR length limits
    if (skill_level && skill_level.length > 50) {
      return NextResponse.json({ error: 'Skill level must be 50 characters or fewer' }, { status: 400 })
    }
    if (city && city.length > 100) {
      return NextResponse.json({ error: 'City must be 100 characters or fewer' }, { status: 400 })
    }
    if (state && state.length > 100) {
      return NextResponse.json({ error: 'State must be 100 characters or fewer' }, { status: 400 })
    }
    if (country && country.length > 100) {
      return NextResponse.json({ error: 'Country must be 100 characters or fewer' }, { status: 400 })
    }

    // Check if student record exists
    const existing = await sql`
      SELECT student_id FROM student WHERE user_id = ${session.id}
    `

    if (existing.length > 0) {
      await sql`
        UPDATE student SET
          name = ${name},
          dob = ${dob || null},
          skill_level = ${skill_level || null},
          city = ${city || null},
          state = ${state || null},
          country = ${country || null}
        WHERE user_id = ${session.id}
      `
    } else {
      await sql`
        INSERT INTO student (user_id, name, dob, skill_level, city, state, country)
        VALUES (${session.id}, ${name}, ${dob || null}, ${skill_level || null}, ${city || null}, ${state || null}, ${country || null})
      `
    }
  }

  if (role === 'instructor') {
    const { contacts } = body

    if (contacts && contacts.length > 200) {
      return NextResponse.json({ error: 'Contacts must be 200 characters or fewer' }, { status: 400 })
    }

    const existing = await sql`
      SELECT instructor_id FROM instructor WHERE user_id = ${session.id}
    `

    if (existing.length > 0) {
      await sql`
        UPDATE instructor SET
          name = ${name},
          contacts = ${contacts || null}
        WHERE user_id = ${session.id}
      `
    } else {
      await sql`
        INSERT INTO instructor (user_id, name, contacts)
        VALUES (${session.id}, ${name}, ${contacts || null})
      `
    }
  }

  return NextResponse.json({ success: true })
}
