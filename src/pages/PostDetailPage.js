import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostById, addComment, incrementViews, toggleLike, isLikedByUser, formatTime, getCurrentUser } from '../utils/communityStorage';

function PostDetailPage() {
  const navigate = useNavigate();
  const { boardId, postId } = useParams();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // 실제 데이터 로드
  useEffect(() => {
    const loadPost = async () => {
      try {
        const postData = await getPostById(postId);
        if (postData) {
          setPost(postData);
          setLiked(isLikedByUser(postData));
          // 조회수 증가 (백엔드에서 자동 처리됨)
          incrementViews(postId);
        } else {
          console.error('게시글을 찾을 수 없습니다:', postId);
        }
      } catch (error) {
        console.error('게시글 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  const handleLike = async () => {
    try {
      const newLikes = await toggleLike(postId);
      setLiked(!liked);
      // 게시글 데이터 업데이트
      if (post) {
        setPost({...post, likes: newLikes});
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      alert('댓글을 입력해주세요.');
      return;
    }

    try {
      const currentUser = getCurrentUser();
      const commentData = {
        content: commentText.trim(),
        author: currentUser.name,
        authorLevel: currentUser.level
      };

      const newComment = await addComment(postId, commentData);
      if (newComment) {
        // 게시글 데이터 새로고침
        const updatedPost = await getPostById(postId);
        setPost(updatedPost);
        setCommentText('');
        alert('댓글이 작성되었습니다!');
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleShare = () => {
    if (post && navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.substring(0, 100) + '...',
        url: window.location.href
      });
    } else {
      alert('공유 기능이 지원되지 않는 브라우저입니다.');
    }
  };

  // 로딩 중이거나 게시글이 없는 경우
  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📄</div>
          <div>게시글을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>❌</div>
          <div style={{ marginBottom: '15px' }}>게시글을 찾을 수 없습니다.</div>
          <button
            onClick={() => navigate(`/board/${boardId}`)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

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
            onClick={() => navigate(`/board/${boardId}`)}
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
              fontSize: '16px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              게시글
            </h1>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleShare}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            📤
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

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto'
      }}>
        {/* Post Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#007AFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              {post.author.charAt(0)}
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#333'
              }}>
                {post.author} {post.authorLevel}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#666'
              }}>
                {formatTime(post.createdAt)} • 조회 {post.views}
              </div>
            </div>
            <div style={{
              marginLeft: 'auto',
              padding: '4px 8px',
              backgroundColor: '#f0f8ff',
              color: '#007AFF',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '500'
            }}>
              {post.category}
            </div>
          </div>

          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '15px',
            lineHeight: '1.4'
          }}>
            {post.title}
          </h2>

          <div style={{
            fontSize: '14px',
            color: '#333',
            lineHeight: '1.6',
            whiteSpace: 'pre-line',
            marginBottom: '20px'
          }}>
            {post.content}
          </div>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '20px'
            }}>
              {post.images.map(image => (
                <div
                  key={image.id}
                  style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px'
                  }}
                >
                  🏛️
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            paddingTop: '15px',
            borderTop: '1px solid #f0f0f0'
          }}>
            <button
              onClick={handleLike}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: 'none',
                color: liked ? '#FF3B30' : '#666',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {liked ? '❤️' : '🤍'} {post.likes || 0}
            </button>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: 'none',
                color: '#666',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              💬 {post.comments?.length || 0}
            </button>
            <button
              onClick={handleBookmark}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'none',
                border: 'none',
                color: bookmarked ? '#FF9500' : '#666',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {bookmarked ? '🔖' : '🏷️'} 스크랩
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div style={{ padding: '20px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#333'
          }}>
            댓글 {post.comments?.length || 0}
          </h3>

          {post.comments && post.comments.length > 0 ? (
            post.comments.map(comment => (
              <div key={comment.id} style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#28a745',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {comment.author.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '5px'
                    }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        {comment.author} {comment.authorLevel}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        color: '#999'
                      }}>
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#333',
                      lineHeight: '1.4',
                      marginBottom: '8px'
                    }}>
                      {comment.content}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px'
                    }}>
                      <button style={{
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}>
                        🤍 {comment.likes || 0}
                      </button>
                      <button style={{
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}>
                        답글
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#666'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>💬</div>
              <div>아직 댓글이 없습니다</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                첫 번째 댓글을 작성해보세요!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comment Input */}
      <div style={{
        padding: '15px 20px',
        borderTop: '1px solid #e0e0e0',
        backgroundColor: 'white',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="댓글을 입력하세요..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 15px',
              border: '1px solid #e0e0e0',
              borderRadius: '20px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            onClick={handleCommentSubmit}
            style={{
              padding: '10px 15px',
              backgroundColor: commentText.trim() ? '#007AFF' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '14px',
              cursor: commentText.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            전송
          </button>
        </div>
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

export default PostDetailPage;