import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const normalize = (value: string) => value.trim().toLowerCase();

const isAdminHost = (host: string, hostname: string) => {
  const configuredRaw = process.env.ADMIN_APP_HOST?.trim();
  if (!configuredRaw) return true;

  const configured = normalize(configuredRaw);
  const requestHost = normalize(host);
  const requestHostname = normalize(hostname);

  if (configured === requestHost || configured === requestHostname) return true;

  const configuredWithoutPort = configured.split(':')[0];
  return configuredWithoutPort === requestHostname;
};

export function middleware(req: NextRequest) {
  const { pathname, host, hostname } = req.nextUrl;

  if (!isAdminHost(host, hostname)) {
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
