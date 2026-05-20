import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isAdminHost = (host: string) => {
  const configured = process.env.ADMIN_APP_HOST?.trim().toLowerCase();
  if (!configured) return true;
  return host.toLowerCase() === configured;
};

export function middleware(req: NextRequest) {
  const { pathname, host } = req.nextUrl;

  if (!isAdminHost(host)) {
    const blockedAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
    if (blockedAdminPath) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin/dashboard')) {
    const role = req.cookies.get('role')?.value;
    if (role !== 'ADMIN' && role !== 'RECRUITER') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
