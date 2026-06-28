import { NextResponse } from 'next/server';

const response = NextResponse.redirect('http://localhost');
// Type info for response.cookies:
// We can check if setAll is a function
console.log(typeof response.cookies.setAll);

// What about iterating?
// NextResponse from 'next/server' needs Next.js environment. We don't have next installed globally? We can test via node + tsx if we set up tsconfig correctly, or just check the Next.js version in package.json.
