import { NextResponse } from 'next/server';
const res = NextResponse.redirect('http://localhost');
// see if cookies is present
console.log(typeof res.cookies);
