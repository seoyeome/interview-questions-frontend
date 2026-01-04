export interface Post {
  id: string;
  userId: number;
  title: string;
  content: string;
  category: 'QUESTION' | 'FREE';
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostListResponse {
  content: Post[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface PostCreateRequest {
  title: string;
  content: string;
  category: string;
}

export interface PostUpdateRequest {
  title: string;
  content: string;
  category: string;
}
