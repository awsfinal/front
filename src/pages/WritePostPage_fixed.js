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
  const [uploading, setUploading] = useState(false);

  // 게시판 정보 (2개로 축소)
  const boardInfo = {
    'photo-share': { title: '사진공유', icon: '📸' },
    'heritage-story': { title: '문화재이야기', icon: '🏛️' }
  };

  const currentBoard = boardInfo[boardId] || { title: '게시판', icon: '📋' };

  const categories = ['일반', '정보공유', '질문', '후기', '모임', '뉴스'];

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    setUploading(true);
    console.log('🖼️ 이미지 업로드 시작:', files.length, '개 파일');
    
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
        console.log('📤 업로드 중:', file.name, `(${(file.size/1024/1024).toFixed(2)}MB)`);
        
        // FormData로 파일 업로드
        const formData = new FormData();
        formData.append('image', file);
        
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5006';
        const uploadUrl = `${apiUrl}/api/upload`;
        console.log('📡 업로드 URL:', uploadUrl);
        
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData
        });
        
        console.log('📨 서버 응답:', response.status, response.statusText);
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ 업로드 성공:', result);
          
          // 서버에서 반환된 URL이 상대 경로인 경우 절대 경로로 변환
          let imageUrl = result.url;
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `${apiUrl}${imageUrl}`;
          }
          
          const newImage = {
            id: Date.now() + Math.random(),
            file: file,
            url: imageUrl, // 완전한 URL 사용
            serverUrl: result.url, // 서버에서 반환된 원본 URL
            name: file.name,
            serverPath: result.path,
            uploadSuccess: true
          };
          
          console.log('🖼️ 새 이미지 객체:', newImage);
          
          setAttachedImages(prev => {
            const updated = [...prev, newImage];
            console.log('📋 업데이트된 이미지 목록:', updated);
            return updated;
          });
          
          console.log(`✅ ${file.name} 업로드 완료!`);
          
        } else {
          const errorText = await response.text();
          console.error('❌ 업로드 실패:', response.status, errorText);
          alert(`${file.name} 업로드에 실패했습니다: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('💥 업로드 오류:', error);
        alert(`${file.name} 업로드 중 오류가 발생했습니다: ${error.message}`);
      }
    }
    
    setUploading(false);
    // 파일 입력 초기화
    event.target.value = '';
  };

  const removeImage = (imageId) => {
    console.log('🗑️ 이미지 제거:', imageId);
    setAttachedImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      console.log('📋 제거 후 이미지 목록:', updated);
      return updated;
    });
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
      console.log('💾 게시글 저장 시작');
      console.log('📝 제목:', title);
      console.log('📄 내용:', content);
      console.log('🏷️ 카테고리:', selectedCategory);
      console.log('🖼️ 첨부 이미지 개수:', attachedImages.length);
      console.log('🖼️ 첨부 이미지 목록:', attachedImages);
      
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
          url: img.serverUrl || img.url, // 서버 URL 우선 사용
          serverPath: img.serverPath,
          uploadSuccess: img.uploadSuccess
        }))
      };

      console.log('💾 저장할 데이터:', postData);
      console.log('🖼️ 이미지 데이터 상세:', postData.images);
      
      const savedPost = await savePost(boardId, postData);
      console.log('✅ 게시글 저장 완료:', savedPost);

      alert('게시글이 작성되었습니다!');
      navigate('/community');
    } catch (error) {
      console.error('💥 게시글 저장 실패:', error);
      alert(`게시글 저장에 실패했습니다: ${error.message}`);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim() || attachedImages.length > 0) {
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
              글쓰기 {uploading && '(업로드 중...)'}
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
          disabled={uploading || !title.trim() || !content.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: (uploading || !title.trim() || !content.trim()) ? '#ccc' : '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: (uploading || !title.trim() || !content.trim()) ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? '업로드 중...' : '완료'}
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
                    onLoad={() => console.log('🖼️ 이미지 로드 성공:', image.url)}
                    onError={(e) => {
                      console.error('💥 이미지 로드 실패:', image.url);
                      e.target.style.display = 'none';
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
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    left: '2px',
                    fontSize: '8px',
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: '1px 3px',
                    borderRadius: '2px'
                  }}>
                    {image.uploadSuccess ? '✅' : '❌'}
                  </div>
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
            backgroundColor: uploading ? '#f0f0f0' : '#f8f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            color: uploading ? '#999' : '#666'
          }}>
            📷 사진 첨부 {uploading && '(업로드 중...)'}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
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
