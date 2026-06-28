import { NextResponse } from 'next/server';
const res = NextResponse.next();
console.log(typeof res.cookies.setAll);
