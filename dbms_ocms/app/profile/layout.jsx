export const metadata = {
  title: 'Profile - QuadBase',
}

import { getSession } from '@/lib/auth'
import { AppSidebar } from '@/components/app-sidebar'

export default async function ProfileLayout({ children }) {
  const session = await getSession()

  // If there's no session, fall back to centered layout (middleware should redirect)
  if (!session) {
    return <div className="min-h-screen flex items-center justify-center">{children}</div>
  }

  return (
    <div className="min-h-screen flex">
      <AppSidebar user={session} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
