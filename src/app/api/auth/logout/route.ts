import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // 쿠키 삭제 (만료 시간을 과거로 설정) - 백엔드와 동일한 이름 사용
  const cookieStore = await cookies();
  cookieStore.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 0,
    path: '/',
  });

  return NextResponse.json({ message: '로그아웃 성공' });
}
