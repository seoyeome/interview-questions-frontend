import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  return proxyRequest(request, proxy, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  return proxyRequest(request, proxy, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  return proxyRequest(request, proxy, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  return proxyRequest(request, proxy, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  return proxyRequest(request, proxy, 'PATCH');
}

async function proxyRequest(
  request: NextRequest,
  proxyPath: string[],
  method: string
) {
  // 쿠키에서 JWT 토큰 가져오기 (백엔드가 설정한 token 쿠키)
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // 백엔드 URL 구성
  const path = proxyPath.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const backendUrl = `${BACKEND_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`;

  // 요청 헤더 구성
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // JWT 토큰이 있으면 Authorization 헤더 추가
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 요청 바디 (GET, DELETE는 제외)
  let body: string | undefined;
  if (method !== 'GET' && method !== 'DELETE') {
    try {
      const requestBody = await request.json();
      body = JSON.stringify(requestBody);
    } catch {
      // 바디가 없는 경우 무시
    }
  }

  try {
    // 백엔드로 프록시 요청
    const response = await fetch(backendUrl, {
      method,
      headers,
      body,
    });

    // 응답 데이터
    const data = await response.text();

    // 백엔드 응답을 그대로 전달
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('프록시 요청 실패:', error);
    return NextResponse.json(
      { message: '서버 요청에 실패했습니다' },
      { status: 500 }
    );
  }
}
