import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPostsByBoard, formatTime, getCurrentUser } from '../utils/communityStorage';

function CommunityPage() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('photo-share');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 2개 게시판만 사용
  const boards = [
    { id: 'photo-share', title: '사진공유', icon: '📸' },
    { id: 'heritage-story', title: '문화재이야기', icon: '🏛️' }
  ];

  // 게시글 데이터 로드
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        console.log('게시글 로드 시작:', selectedTab);
        const loadedPosts = await getPostsByBoard(selectedTab, 'latest');
        console.log('로드된 게시글:', loadedPosts);
        setPosts(loadedPosts || []);
      } catch (error) {
        console.error('게시글 로드 오류:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [selectedTab]);

  const handlePostClick = (postId) => {
    navigate(`/board/${selectedTab}/post/${postId}`);
  };

  const handleWritePost = () => {
    navigate(`/board/${selectedTab}/write`);
  };

  const handleLike = (postId) => {
    // 좋아요 기능 구현
    console.log('좋아요:', postId);
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#fafafa',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Instagram-style Header */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: 'white',
        borderBottom: '1px solid #dbdbdb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/main')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <h1 style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: '600',
            color: '#262626'
          }}>
            찍지오
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/board/my-posts')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#e1306c',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="내가 쓴 글"
          >
            {getCurrentUser().name?.charAt(0) || 'U'}
          </button>
          <button
            onClick={handleWritePost}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ➕
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        backgroundColor: 'white',
        borderBottom: '1px solid #dbdbdb',
        flexShrink: 0
      }}>
        {boards.map(board => (
          <button
            key={board.id}
            onClick={() => setSelectedTab(board.id)}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              color: selectedTab === board.id ? '#262626' : '#8e8e8e',
              fontSize: '14px',
              fontWeight: selectedTab === board.id ? '600' : '400',
              cursor: 'pointer',
              borderBottom: selectedTab === board.id ? '1px solid #262626' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>{board.icon}</span>
            <span>{board.title}</span>
          </button>
        ))}
      </div>

      {/* Instagram-style Feed */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        backgroundColor: '#fafafa'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            color: '#8e8e8e'
          }}>
            로딩 중...
          </div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <div
              key={post.id}
              style={{
                backgroundColor: 'white',
                marginBottom: '12px',
                border: '1px solid #dbdbdb'
              }}
            >
              {/* Post Header */}
              <div style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#e1306c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {post.author?.charAt(0) || 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#262626'
                  }}>
                    {post.author || '익명'}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#8e8e8e'
                  }}>
                    {formatTime(post.createdAt)}
                  </div>
                </div>
                <button style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}>
                  ⋯
                </button>
              </div>

              {/* Post Image */}
              {post.images && post.images.length > 0 ? (
                <div style={{
                  width: '100%',
                  height: '300px',
                  backgroundColor: '#f0f0f0',
                  overflow: 'hidden'
                }}>
                  {(() => {
                    const image = post.images[0];
                    let imageUrl = image.url;

                    // 서버 URL 처리
                    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('blob:')) {
                      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5006';
                      imageUrl = `${apiUrl}${imageUrl}`;
                    }

                    return imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="게시글 이미지"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          console.error('이미지 로드 실패:', imageUrl);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null;
                  })()}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    color: '#8e8e8e'
                  }}>
                    📸
                  </div>
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  color: '#8e8e8e'
                }}>
                  📝
                </div>
              )}

              {/* Post Actions */}
              <div style={{
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <button
                  onClick={() => handleLike(post.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer'
                  }}
                >
                  ❤️
                </button>
                <button
                  onClick={() => handlePostClick(post.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer'
                  }}
                >
                  💬
                </button>
                <button style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}>
                  📤
                </button>
              </div>

              {/* Post Stats */}
              <div style={{
                padding: '0 16px 4px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#262626'
              }}>
                좋아요 {post.likes || 0}개
              </div>

              {/* Post Content */}
              <div style={{
                padding: '0 16px 12px'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#262626',
                  lineHeight: '1.4'
                }}>
                  <span style={{ fontWeight: '600', marginRight: '8px' }}>
                    {post.author || '익명'}
                  </span>
                  {post.title && (
                    <span style={{ fontWeight: '600', marginRight: '8px' }}>
                      {post.title}
                    </span>
                  )}
                  {post.content}
                </div>
                {post.comments && post.comments.length > 0 && (
                  <button
                    onClick={() => handlePostClick(post.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#8e8e8e',
                      fontSize: '14px',
                      cursor: 'pointer',
                      marginTop: '4px',
                      padding: 0
                    }}
                  >
                    댓글 {post.comments.length}개 모두 보기
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '300px',
            color: '#8e8e8e'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>아직 게시글이 없습니다</div>
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>첫 번째 게시글을 올려보세요!</div>
            <button
              onClick={handleWritePost}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0095f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              게시글 작성
            </button>
          </div>
        )}
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

export default CommunityPage;