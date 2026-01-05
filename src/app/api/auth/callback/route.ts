import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  // 에러 처리
  if (error) {
    return NextResponse.redirect(new URL(`/auth/signin?error=${error}`, request.url));
  }

  // 토큰이 없으면 에러
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin?error=no_token', request.url));
  }

  // HttpOnly 쿠키에 JWT 저장 (백엔드와 동일한 이름 사용)
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none', // 백엔드와 동일하게 None 사용
    maxAge: 60 * 60 * 24, // 24시간
    path: '/',
  });

  // 대시보드로 리다이렉트
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
