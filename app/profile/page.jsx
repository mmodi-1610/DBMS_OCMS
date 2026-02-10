import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/db'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import ProfileForm from '@/components/profile-form'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/')

  if (!['student', 'instructor'].includes(session.role)) {
    redirect('/')
  }

  if (session.role === 'student') {
    const rows = await sql`
      SELECT * FROM student WHERE user_id = ${session.id}
    `
    const student = rows[0] || null
    return (
      <div className="min-h-screen flex items-center justify-center p-6 py-12">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Student Profile</CardTitle>
            <CardDescription>Manage your student profile</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm role="student" data={student} />
          </CardContent>
        </Card>
      </div>
    )
  }

  // instructor
  const rows = await sql`
    SELECT * FROM instructor WHERE user_id = ${session.id}
  `
  const instructor = rows[0] || null

  return (
    <div className="min-h-screen flex items-center justify-center p-6 py-12">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Instructor Profile</CardTitle>
          <CardDescription>Manage your instructor profile</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm role="instructor" data={instructor} />
        </CardContent>
      </Card>
    </div>
  )
}
