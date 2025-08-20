// 커뮤니티 데이터 관리를 위한 백엔드 API 유틸리티

// API 기본 URL 설정 (환경변수 우선 사용)
const getApiBaseUrl = () => {
  // 환경변수가 설정되어 있으면 우선 사용
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // ngrok 환경 감지
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // ngrok URL 패턴 감지 (*.ngrok.io, *.ngrok-free.app 등)
  if (hostname.includes("ngrok") || hostname.includes("tunnel")) {
    // ngrok 환경에서는 현재 도메인을 사용
    return `${protocol}//${hostname}`;
  }
  
  // 로컬 개발 환경
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5006";
  }
  
  // 기타 환경에서는 현재 도메인 사용
  return `${protocol}//${hostname}`;
};

const API_BASE_URL = getApiBaseUrl();

console.log('API_BASE_URL:', API_BASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('hostname:', window.location.hostname);

// 서버 연결 테스트 함수
export const testServerConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/test`);
    const data = await response.json();
    console.log('서버 연결 테스트 성공:', data);
    return true;
  } catch (error) {
    console.error('서버 연결 테스트 실패:', error);
    return false;
  }
};

// 현재 사용자 ID (실제로는 로그인 시스템에서 가져와야 함)
const getCurrentUserId = () => {
  let userId = localStorage.getItem('currentUserId');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('currentUserId', userId);
  }
  return userId;
};

// 응답 타입 검사 함수
const isLikelyHtml = (response) => {
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('text/html');
};

const isNgrokWarning = (html) => {
  return /ngrok|Visit Site|browser-warning|only-tunnel-hostname/i.test(html);
};

// API 호출 헬퍼 함수
const apiCall = async (url, options = {}) => {
  try {
    console.log('API 호출 시도:', `${API_BASE_URL}${url}`);

    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'MyApp/1.0',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    });

    console.log('API 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 응답이 HTML인지 확인
    if (isLikelyHtml(response)) {
      const htmlText = await response.text();
      console.error('❌ HTML 응답을 받았습니다.');
      console.error('Content-Type:', response.headers.get('content-type'));
      console.error('HTML 내용 일부:', htmlText.substring(0, 200));
      
      if (isNgrokWarning(htmlText)) {
        console.error('🚧 ngrok 경고 페이지 감지됨');
        throw new Error('ngrok 경고 페이지 응답입니다. 브라우저에서 한 번 "Visit Site"를 눌러주세요.');
      } else {
        console.error('🔧 라우팅/프록시 문제 가능성');
        throw new Error('HTML 응답을 받았습니다. (아마 라우팅/프록시 문제) API 서버 설정을 확인하세요.');
      }
    }

    const data = await response.json();
    console.log('API 응답 데이터:', data);
    return data;
  } catch (error) {
    console.error('API 호출 오류:', error);

    // 백엔드 서버가 실행되지 않은 경우 또는 HTML 응답인 경우
    if (error.message.includes('Failed to fetch') ||
      error.message.includes('<!doctype') ||
      error.message.includes('HTML 응답') ||
      error.message.includes('Unexpected token')) {
      console.warn('🚨 ngrok 경고 페이지 또는 서버 연결 문제입니다. localStorage를 사용합니다.');
      console.warn('💡 해결 방법: 브라우저에서 ngrok URL에 직접 접속하여 "Visit Site" 버튼을 클릭하세요.');
      return { success: false, useLocalStorage: true };
    }

    throw error;
  }
};

// 게시글 저장
export const savePost = async (boardId, postData) => {
  try {
    const response = await apiCall('/api/community/posts', {
      method: 'POST',
      body: JSON.stringify({
        boardId,
        userId: getCurrentUserId(),
        ...postData
      })
    });

    if (response.success) {
      return response.post;
    } else {
      throw new Error(response.message || '게시글 저장 실패');
    }
  } catch (error) {
    console.error('게시글 저장 오류:', error);
    throw error;
  }
};

// 특정 게시판의 게시글 가져오기
export const getPostsByBoard = async (boardId, sort = 'latest') => {
  try {
    const userId = getCurrentUserId();
    console.log('🔍 getPostsByBoard 호출:', { boardId, userId, sort });

    const response = await apiCall(`/api/community/posts/${boardId}?userId=${userId}&sort=${sort}`);

    console.log('🔍 getPostsByBoard 응답:', response);

    // 서버 연결 실패 시 localStorage 사용
    if (response && response.useLocalStorage) {
      console.log('📦 localStorage에서 게시글 로드');
      return getLocalPosts(boardId);
    }

    // 정상 응답 처리
    if (response && response.success && Array.isArray(response.posts)) {
      console.log('✅ 게시글 목록 조회 성공:', response.posts.length, '개');
      return response.posts;
    }

    // 백엔드가 배열만 보낸 경우 (fallback)
    if (Array.isArray(response)) {
      console.log('🔄 배열 응답 감지, fallback 처리:', response.length, '개');
      return response;
    }

    // 기타 실패 케이스
    console.error('❌ 게시글 목록 조회 실패:', response?.message || '알 수 없는 오류');
    return getLocalPosts(boardId);
    
  } catch (error) {
    console.error('❌ 게시글 목록 조회 오류:', error);
    return getLocalPosts(boardId);
  }
};

// 내가 쓴 글 가져오기
export const getMyPosts = async () => {
  return await getPostsByBoard('my-posts');
};

// 댓글 단 글 가져오기
export const getCommentedPosts = async () => {
  return await getPostsByBoard('commented-posts');
};

// 특정 게시글 가져오기
export const getPostById = async (postId) => {
  try {
    const response = await apiCall(`/api/community/post/${postId}`);

    if (response.success) {
      return response.post;
    } else {
      throw new Error(response.message || '게시글 조회 실패');
    }
  } catch (error) {
    console.error('게시글 조회 오류:', error);
    return null;
  }
};

// 댓글 추가
export const addComment = async (postId, commentData) => {
  try {
    const response = await apiCall('/api/community/comments', {
      method: 'POST',
      body: JSON.stringify({
        postId,
        userId: getCurrentUserId(),
        ...commentData
      })
    });

    if (response.success) {
      return response.comment;
    } else {
      throw new Error(response.message || '댓글 작성 실패');
    }
  } catch (error) {
    console.error('댓글 작성 오류:', error);
    throw error;
  }
};

// 조회수 증가 (백엔드에서 자동 처리됨)
export const incrementViews = (postId) => {
  // 백엔드에서 게시글 조회 시 자동으로 조회수가 증가하므로 별도 처리 불필요
  console.log(`조회수 증가: ${postId}`);
};

// 좋아요 토글
export const toggleLike = async (postId) => {
  try {
    const response = await apiCall(`/api/community/like/${postId}`, {
      method: 'POST',
      body: JSON.stringify({
        userId: getCurrentUserId()
      })
    });

    if (response.success) {
      return response.likes;
    } else {
      throw new Error(response.message || '좋아요 처리 실패');
    }
  } catch (error) {
    console.error('좋아요 처리 오류:', error);
    return 0;
  }
};

// 사용자가 좋아요 했는지 확인 (게시글 데이터에서 확인)
export const isLikedByUser = (post) => {
  const currentUserId = getCurrentUserId();
  return post && post.likedBy && post.likedBy.includes(currentUserId);
};

// 게시판별 게시글 수 조회
export const getBoardPostCount = async (boardId) => {
  try {
    const userId = getCurrentUserId();
    const response = await apiCall(`/api/community/stats/${boardId}?userId=${userId}`);

    if (response.success) {
      return response.count;
    } else {
      return 0;
    }
  } catch (error) {
    console.error('게시판 통계 조회 오류:', error);
    return 0;
  }
};

// 시간 포맷팅 (백엔드에서 처리되지만 클라이언트에서도 사용 가능)
export const formatTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}일 전`;

  return date.toLocaleDateString();
};

// localStorage에서 게시글 가져오기 (fallback)
const getLocalPosts = (boardId) => {
  try {
    const localPosts = localStorage.getItem(`posts_${boardId}`);
    if (localPosts) {
      const posts = JSON.parse(localPosts);
      console.log('📦 localStorage에서 게시글 로드:', posts.length, '개');
      return posts;
    }
    
    // 샘플 데이터 생성 (서버 연결 실패 시)
    const samplePosts = generateSamplePosts(boardId);
    localStorage.setItem(`posts_${boardId}`, JSON.stringify(samplePosts));
    console.log('🎯 샘플 게시글 생성:', samplePosts.length, '개');
    return samplePosts;
  } catch (error) {
    console.error('localStorage 게시글 로드 오류:', error);
    return [];
  }
};

// 샘플 게시글 생성
const generateSamplePosts = (boardId) => {
  const boardTitles = {
    'heritage-info': ['경복궁 근정전 복원 과정', '창덕궁 후원 비밀의 정원', '종묘 제례악의 의미'],
    'photo-share': ['경복궁 야경 사진', '창덕궁 단풍 명소', '덕수궁 돌담길 산책'],
    'travel-review': ['경복궁 관람 후기', '창덕궁 가이드 투어 체험', '종묘 방문 소감'],
    'history-story': ['조선왕조의 건축 철학', '궁궐 건축의 과학적 원리', '전통 건축의 현대적 의미'],
    'qna': ['경복궁 관람 시간 문의', '창덕궁 예약 방법', '종묘 제례 관람 가능한가요?'],
    'meetup': ['경복궁 사진 촬영 모임', '궁궐 탐방 동호회', '전통 건축 스터디 그룹'],
    'news': ['경복궁 야간 개장 소식', '창덕궁 유네스코 등재 기념', '종묘 보수 공사 완료'],
    'events': ['궁궐 문화축제 개최', '전통 건축 사진 공모전', '궁궐 야간 투어 이벤트']
  };

  const titles = boardTitles[boardId] || ['게시글 제목 1', '게시글 제목 2', '게시글 제목 3'];
  const currentUser = getCurrentUser();

  return titles.map((title, index) => ({
    id: `local_${boardId}_${index + 1}`,
    boardId: boardId,
    title: title,
    content: `${title}에 대한 내용입니다. 서버 연결이 복구되면 실제 데이터를 확인할 수 있습니다.`,
    category: '일반',
    authorId: currentUser.id,
    author: currentUser.name,
    authorLevel: currentUser.level,
    likes: Math.floor(Math.random() * 20),
    views: Math.floor(Math.random() * 100),
    images: [],
    likedBy: [],
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    comments: []
  }));
};

// 현재 사용자 정보
export const getCurrentUser = () => {
  return {
    id: getCurrentUserId(),
    name: '사용자' + getCurrentUserId().slice(-4),
    level: 'Lv.' + Math.floor(Math.random() * 20 + 1)
  };
};