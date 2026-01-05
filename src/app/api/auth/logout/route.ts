import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // 쿠키 삭제 (만료 시간을 과거로 설정)
  const cookieStore = await cookies();
  cookieStore.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // 로그인과 동일하게 lax 사용 (Same-Site 구조)
    maxAge: 0,
    path: '/',
  });

  return NextResponse.json({ message: '로그아웃 성공' });
}
