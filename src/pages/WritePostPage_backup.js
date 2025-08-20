import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { savePost, getCurrentUser } from '../utils/communityStorage';

function WritePostPage() {
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('일반');
  const [attachedImages, setAttachedImages] = useState([]);

  // 게시판 정보 (2개로 축소)
  const boardInfo = {
    'photo-share': { title: '사진공유', icon: '📸' },
    'heritage-story': { title: '문화재이야기', icon: '🏛️' }
  };

  const currentBoard = boardInfo[boardId] || { title: '게시판', icon: '📋' };

  const categories = ['일반', '정보공유', '질문', '후기', '모임', '뉴스'];

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        alert(`${file.name}은(는) 이미지 파일이 아닙니다.`);
        continue;
      }
      
      // 파일 크기 검증 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name}은(는) 파일 크기가 너무 큽니다. (최대 10MB)`);
        continue;
      }

      try {
        console.log('이미지 업로드 시작:', file.name, file.type, 'Size:', file.size);
        
        // FormData로 파일 업로드
        const formData = new FormData();
        formData.append('image', file);
        
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5006';
        const response = await fetch(`${apiUrl}/api/upload`, {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('이미지 업로드 성공:', result);
          
          const newImage = {
            id: Date.now() + Math.random(),
            file: file,
            url: result.url, // 서버에서 반환된 실제 URL
            name: file.name,
            serverPath: result.path
          };
          
          setAttachedImages(prev => [...prev, newImage]);
        } else {
          console.error('이미지 업로드 실패:', response.status);
          
          // 업로드 실패 시 임시 URL 사용 (fallback)
          const newImage = {
            id: Date.now() + Math.random(),
            file: file,
            url: URL.createObjectURL(file),
            name: file.name,
            isTemporary: true
          };
          
          setAttachedImages(prev => [...prev, newImage]);
          alert(`${file.name} 업로드에 실패했습니다. 임시로 표시됩니다.`);
        }
      } catch (error) {
        console.error('이미지 업로드 오류:', error);
        
        // 오류 시 임시 URL 사용 (fallback)
        const newImage = {
          id: Date.now() + Math.random(),
          file: file,
          url: URL.createObjectURL(file),
          name: file.name,
          isTemporary: true
        };
        
        setAttachedImages(prev => [...prev, newImage]);
        alert(`${file.name} 업로드 중 오류가 발생했습니다. 임시로 표시됩니다.`);
      }
    }
  };

  const removeImage = (imageId) => {
    setAttachedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      console.log('게시글 저장 시작:', { boardId, title, content, selectedCategory });
      
      // 실제 게시글 저장
      const currentUser = getCurrentUser();
      const postData = {
        title: title.trim(),
        content: content.trim(),
        category: selectedCategory,
        author: currentUser.name,
        authorLevel: currentUser.level,
        images: attachedImages.map(img => ({
          id: img.id,
          name: img.name,
          url: img.url, // 서버에서 반환된 URL 그대로 사용
          isTemporary: img.isTemporary || false
        }))
      };

      console.log('저장할 데이터:', postData);
      const savedPost = await savePost(boardId, postData);
      console.log('게시글 저장 완료:', savedPost);

      alert('게시글이 작성되었습니다!');
      navigate('/community');
    } catch (error) {
      console.error('게시글 저장 실패:', error);
      alert(`게시글 저장에 실패했습니다: ${error.message}`);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      if (window.confirm('작성 중인 내용이 있습니다. 정말 나가시겠습니까?')) {
        navigate('/community');
      }
    } else {
      navigate('/community');
    }
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
            onClick={handleCancel}
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
              글쓰기
            </h1>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#666'
            }}>
              {currentBoard.title}
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          style={{
            padding: '8px 16px',
            backgroundColor: title.trim() && content.trim() ? '#007AFF' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: title.trim() && content.trim() ? 'pointer' : 'not-allowed'
          }}
        >
          완료
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflow: 'auto'
      }}>
        {/* Category Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            color: '#333'
          }}>
            카테고리
          </label>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '15px',
                  border: selectedCategory === category ? '1px solid #007AFF' : '1px solid #e0e0e0',
                  backgroundColor: selectedCategory === category ? '#f0f8ff' : 'white',
                  color: selectedCategory === category ? '#007AFF' : '#666',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Title Input */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '15px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Content Input */}
        <div style={{ marginBottom: '20px' }}>
          <textarea
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '15px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Image Attachments */}
        {attachedImages.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#333'
            }}>
              첨부된 이미지 ({attachedImages.length})
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              {attachedImages.map(image => (
                <div
                  key={image.id}
                  style={{
                    position: 'relative',
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <button
                    onClick={() => removeImage(image.id)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      border: 'none',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '10px',
          paddingBottom: '20px'
        }}>
          <label style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            textAlign: 'center',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#666'
          }}>
            📷 사진 첨부
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </label>
          <button
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#666',
              cursor: 'pointer'
            }}
          >
            📍 위치 추가
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

export default WritePostPage;