import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  // 쿠키 삭제
  cookies().delete('auth_token');

  return NextResponse.json({ message: '로그아웃 성공' });
}
