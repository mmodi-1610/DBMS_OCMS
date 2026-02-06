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
