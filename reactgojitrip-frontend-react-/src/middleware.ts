/**
 * Middleware stub for client-side React app.
 * Route protection is handled in client-side AuthGuard.
 */
export function middleware(request: { url: string; nextUrl: { pathname: string } }) {
  return request;
}

