import { NextResponse } from 'next/server'

export function middleware(req) {
  const { pathname } = req.nextUrl

  // Protect profile routes
  if (pathname.startsWith('/profile')) {
    const cookie = req.cookies.get('quadbase_session')
    if (!cookie?.value) {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    try {
      const session = JSON.parse(cookie.value)
      if (!session || !['student', 'instructor'].includes(session.role)) {
        const url = req.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    } catch (e) {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // Protect course routes - students only
  if (pathname.startsWith('/courses/')) {
    const cookie = req.cookies.get('quadbase_session')
    if (!cookie?.value) {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    try {
      const session = JSON.parse(cookie.value)
      if (!session || session.role !== 'student') {
        const url = req.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    } catch (e) {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/profile/:path*', '/profile', '/courses/:path*'],
}
