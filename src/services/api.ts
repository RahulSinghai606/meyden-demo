// API service for Meyden backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'An error occurred',
          code: data.code,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    }
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) {
    return this.request<{
      message: string;
      user: any;
      emailVerificationRequired: boolean;
    }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<{
      message: string;
      user: any;
      tokens: {
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
      };
      session: any;
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(token: string) {
    return this.request('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Vendor endpoints
  async getVendors(query?: {
    query?: string;
    industry?: string;
    country?: string;
    city?: string;
    minRating?: number;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (query?.query) params.append('query', query.query);
    if (query?.industry) params.append('industry', query.industry);
    if (query?.country) params.append('country', query.country);
    if (query?.city) params.append('city', query.city);
    if (query?.minRating) params.append('minRating', query.minRating.toString());
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/api/v1/vendors?${queryString}` : '/api/v1/vendors';
    
    return this.request<{
      vendors: any[];
      pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>(endpoint);
  }

  async getVendorById(id: string) {
    return this.request<{
      vendor: any;
    }>(`/api/v1/vendors/${id}`);
  }

  async getPopularVendors(limit?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/v1/vendors/popular/list?${queryString}` : '/api/v1/vendors/popular/list';
    
    return this.request<{
      vendors: any[];
    }>(endpoint);
  }

  // Community endpoints
  async getCommunityPosts() {
    return this.request<{
      posts: any[];
    }>('/api/v1/community/posts');
  }

  async createCommunityPost(postData: {
    title: string;
    content: string;
    type?: string;
    categoryId?: string;
  }, token: string) {
    return this.request<{
      message: string;
      post: any;
    }>('/api/v1/community/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });
  }

  // AI Readiness endpoints
  async getSurveys(params?: {
    page?: number;
    limit?: number;
    category?: string;
    public?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.public !== undefined) queryParams.append('public', params.public.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/v1/ai-readiness/surveys?${queryString}` : '/api/v1/ai-readiness/surveys';
    
    return this.request<{
      surveys: any[];
      pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>(endpoint);
  }

  async getSurveyById(id: string) {
    return this.request<{
      survey: {
        id: string;
        title: string;
        description?: string;
        questions: Array<{
          id: string;
          text: string;
          options?: string;
          type: string;
          order: number;
          maxScore: number;
        }>;
      };
    }>(`/api/v1/ai-readiness/surveys/${id}`);
  }

  async submitSurveyResponse(responseData: {
    surveyId: string;
    answers: Array<{
      questionId: string;
      answer: any;
      timeSpent?: number;
    }>;
    deviceInfo?: string;
    feedback?: string;
  }, token: string) {
    return this.request<{
      message: string;
      response: {
        id: string;
        totalScore: number;
        maxScore: number;
        percentage: number;
        grade: string;
      };
    }>('/api/v1/ai-readiness/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(responseData),
    });
  }

  async getUserSurveyResponses(token: string) {
    return this.request<{
      responses: any[];
    }>('/api/v1/ai-readiness/responses/my', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // User endpoints
  async getUserProfile(token: string) {
    return this.request<{
      user: any;
      profile: any;
    }>('/api/v1/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateUserProfile(profileData: any, token: string) {
    return this.request<{
      message: string;
      profile: any;
    }>('/api/v1/users/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  }

  // Health check
  async healthCheck() {
    return this.request<{
      status: string;
      timestamp: string;
      uptime: number;
      environment: string;
      version: string;
    }>('/health');
  }
}

// Create and export the API service instance
export const apiService = new ApiService(API_BASE_URL);