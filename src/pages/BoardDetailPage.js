import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostsByBoard, getMyPosts, getCommentedPosts, formatTime, testServerConnection } from '../utils/communityStorage';

function BoardDetailPage() {
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [selectedSort, setSelectedSort] = useState('최신순');
  const [posts, setPosts] = useState([]);
  const [serverBlocked, setServerBlocked] = useState(false);
  const loadingRef = useRef(false);

  // 게시판 정보 (2개로 축소)
  const boardInfo = {
    'photo-share': { title: '사진공유', subtitle: '문화재 사진 공유', icon: '📸' },
    'heritage-story': { title: '문화재이야기', subtitle: '문화재 관련 이야기', icon: '🏛️' },
    'my-posts': { title: '내가 쓴 글', subtitle: '내가 작성한 게시글', icon: '📝' },
    'commented-posts': { title: '댓글 단 글', subtitle: '댓글을 단 게시글', icon: '💬' }
  };

  const currentBoard = boardInfo[boardId] || { title: '게시판', subtitle: '', icon: '📋' };

  // 실제 데이터 로드
  useEffect(() => {
    const loadPosts = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      try {
        console.log('게시글 로드 시작:', { boardId, selectedSort });

        // 서버 연결 체크
        const serverOk = await testServerConnection();
        setServerBlocked(!serverOk);

        let loadedPosts = [];

        if (boardId === 'my-posts') {
          loadedPosts = await getMyPosts();
          console.log('내가 쓴 글 로드 완료:', loadedPosts);
        } else if (boardId === 'commented-posts') {
          loadedPosts = await getCommentedPosts();
          console.log('댓글 단 글 로드 완료:', loadedPosts);
        } else {
          // 정렬 옵션을 백엔드로 전달
          const sortMap = {
            '최신순': 'latest',
            '인기순': 'popular',
            '댓글순': 'comments',
            '조회순': 'views'
          };
          const sortOption = sortMap[selectedSort] || 'latest';
          console.log('게시판 게시글 로드 중:', { boardId, sortOption });
          loadedPosts = await getPostsByBoard(boardId, sortOption);
          console.log('게시판 게시글 로드 완료:', loadedPosts);
        }

        // 서버가 막혀있고 빈 배열이면 서버 블록 상태 표시
        if (Array.isArray(loadedPosts) && loadedPosts.length === 0 && !serverOk) {
          setServerBlocked(true);
        }

        // 클라이언트 사이드 정렬 (백엔드에서 정렬되지만 추가 보장)
        const sortedPosts = sortPosts(loadedPosts, selectedSort);
        console.log('정렬된 게시글:', sortedPosts);
        setPosts(sortedPosts);
      } catch (error) {
        console.error('게시글 로드 오류:', error);
        setServerBlocked(true);
        setPosts([]);
      } finally {
        loadingRef.current = false;
      }
    };

    loadPosts();
  }, [boardId, selectedSort]);

  // 게시글 정렬 함수 (안전한 정렬)
  const sortPosts = (postsToSort, sortType) => {
    const safe = (v, d = 0) => (typeof v === 'number' ? v : d);
    const dt = (v) => (v ? new Date(v).getTime() : 0);
    const sorted = [...(postsToSort || [])];

    switch (sortType) {
      case '최신순':
        return sorted.sort((a, b) => dt(b?.createdAt) - dt(a?.createdAt));
      case '인기순':
        return sorted.sort((a, b) => safe(b?.likes) - safe(a?.likes));
      case '댓글순':
        return sorted.sort((a, b) => safe(b?.comments?.length) - safe(a?.comments?.length));
      case '조회순':
        return sorted.sort((a, b) => safe(b?.views) - safe(a?.views));
      default:
        return sorted;
    }
  };

  const sortOptions = ['최신순', '인기순', '댓글순', '조회순'];

  const handlePostClick = (postId) => {
    console.log(`게시글 클릭: ${postId}`);
    navigate(`/board/${boardId}/post/${postId}`);
  };

  const handleWritePost = () => {
    console.log('글쓰기 버튼 클릭');
    navigate(`/board/${boardId}/write`);
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: 'white',
      color: '#333',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px 20px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        backgroundColor: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={() => navigate('/community')}
            style={{
              background: 'none',
              border: 'none',
              color: '#333',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              {currentBoard.title}
            </h1>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#666'
            }}>
              {currentBoard.subtitle}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer'
            }}
            title="새로고침"
          >
            🔄
          </button>
          <button style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer'
          }}>
            🔍
          </button>
          <button style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer'
          }}>
            ⋮
          </button>
        </div>
      </div>

      {/* Server Block Warning Banner */}
      {serverBlocked && (
        <div style={{
          margin: '10px 20px 0',
          padding: '10px 12px',
          background: '#FFF4E5',
          border: '1px solid #FFD8A8',
          color: '#8B5E00',
          borderRadius: 8,
          fontSize: 12
        }}>
          🚧 서버 응답이 HTML/ngrok 경고로 차단되어 <b>로컬 저장소 모드</b>로 전환되었습니다.
          브라우저에서 ngrok 주소를 열어 <b>Visit Site</b> 클릭 후 다시 시도하거나,
          <button
            onClick={() => window.location.reload()}
            style={{
              marginLeft: 8,
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid #FFD8A8',
              background: 'white',
              cursor: 'pointer',
              fontSize: 11
            }}
          >
            다시 시도
          </button>
        </div>
      )}

      {/* Banner */}
      <div style={{
        margin: '15px 20px',
        padding: '15px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '5px'
        }}>
          📸 문화재 사진 공모전 개최!
        </div>
        <div style={{
          fontSize: '12px',
          opacity: 0.9
        }}>
          나만의 문화재 사진을 공유하고 상품을 받아가세요
        </div>
        <div style={{
          position: 'absolute',
          right: '15px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '30px',
          opacity: 0.3
        }}>
          🏛️
        </div>
      </div>

      {/* Sort Options */}
      <div style={{
        padding: '0 20px 15px',
        display: 'flex',
        gap: '10px'
      }}>
        {sortOptions.map(option => (
          <button
            key={option}
            onClick={() => setSelectedSort(option)}
            style={{
              padding: '6px 12px',
              borderRadius: '15px',
              border: selectedSort === option ? '1px solid #007AFF' : '1px solid #e0e0e0',
              backgroundColor: selectedSort === option ? '#f0f8ff' : 'white',
              color: selectedSort === option ? '#007AFF' : '#666',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '0 20px'
      }}>
        {posts.length > 0 ? (
          posts.map(post => (
            <div
              key={post.id}
              onClick={() => handlePostClick(post.id)}
              style={{
                padding: '15px 0',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                {/* Author Avatar */}
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: post.category === '질문' ? '#00C896' : '#007AFF',
                  borderRadius: '50%',
                  marginTop: '6px',
                  flexShrink: 0
                }}></div>

                {/* Post Content */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333',
                    marginBottom: '4px',
                    lineHeight: '1.4'
                  }}>
                    {post.title}
                  </div>

                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginBottom: '8px',
                    lineHeight: '1.3'
                  }}>
                    {post.content && post.content.length > 50
                      ? post.content.substring(0, 50) + '...'
                      : post.content}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '11px',
                    color: '#999'
                  }}>
                    <span>❤️ {post.likes || 0}</span>
                    <span>💬 {post.comments?.length || 0}</span>
                    <span>{formatTime(post.createdAt)}</span>
                    <span>조회 {post.views || 0}</span>
                  </div>
                </div>

                {/* Post Image */}
                {post.images && post.images.length > 0 ? (
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {post.images[0].url ? (
                      <img
                        src={post.images[0].url}
                        alt="게시글 이미지"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        📸
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0,
                    color: '#8e8e8e'
                  }}>
                    📝
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>아직 게시글이 없습니다</div>
            <div style={{ fontSize: '14px', color: '#999', marginBottom: '20px' }}>
              {boardId === 'my-posts' ? '첫 번째 글을 작성해보세요!' :
                boardId === 'commented-posts' ? '댓글을 달아보세요!' :
                  '첫 번째 글을 작성해보세요!'}
            </div>
            <button
              onClick={async () => {
                console.log('🔄 수동 데이터 새로고침 시작');
                try {
                  const loadedPosts = await getPostsByBoard(boardId, 'latest');
                  console.log('🔄 수동 새로고침 결과:', loadedPosts);
                  setPosts(loadedPosts);
                } catch (error) {
                  console.error('🔄 수동 새로고침 실패:', error);
                }
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007AFF',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 데이터 새로고침
            </button>
          </div>
        )}
      </div>

      {/* Write Button */}
      <div style={{
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={handleWritePost}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#007AFF',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✏️
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="nav-bar">
        <div
          className="nav-item"
          onClick={() => navigate('/stamp')}
          style={{ cursor: 'pointer' }}
        >
          <div
            className="nav-icon"
            style={{ backgroundImage: 'url(/image/rubber-stamp.png)' }}
          ></div>
          <span>스탬프</span>
        </div>
        <div
          className="nav-item"
          onClick={() => navigate('/camera')}
          style={{ cursor: 'pointer' }}
        >
          <div
            className="nav-icon"
            style={{ backgroundImage: 'url(/image/nav_camera.png)' }}
          ></div>
          <span>사진찍기</span>
        </div>
        <div
          className="nav-item"
          onClick={() => navigate('/settings')}
          style={{ cursor: 'pointer' }}
        >
          <div
            className="nav-icon"
            style={{ backgroundImage: 'url(/image/settings.png)' }}
          ></div>
          <span>설정</span>
        </div>
      </div>
    </div>
  );
}

export default BoardDetailPage;