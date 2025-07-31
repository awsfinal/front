import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ToiletPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    disabled: false,
    allDay: false
  });

  const toggleFilter = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  return (
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#f5f5f5', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '15px 20px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <button 
          onClick={() => navigate('/main')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#333'
          }}
        >
          ←
        </button>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>공용화장실</span>
        <div style={{ fontSize: '14px', color: '#007AFF' }}>
          120m
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        padding: '15px 20px', 
        borderBottom: '1px solid #eee',
        backgroundColor: 'white',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => toggleFilter('disabled')}
            style={{ 
              fontSize: '14px', 
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #007AFF',
              backgroundColor: filters.disabled ? '#007AFF' : 'white',
              color: filters.disabled ? 'white' : '#007AFF',
              cursor: 'pointer'
            }}
          >
            장애인전용
          </button>
          <button 
            onClick={() => toggleFilter('allDay')}
            style={{ 
              fontSize: '14px', 
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #007AFF',
              backgroundColor: filters.allDay ? '#007AFF' : 'white',
              color: filters.allDay ? 'white' : '#007AFF',
              cursor: 'pointer'
            }}
          >
            24시간
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        flex: 1, 
        padding: '15px 20px', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Map */}
        <div style={{
          backgroundColor: '#f0f0f0',
          borderRadius: '12px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          flexShrink: 0
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🗺️</div>
            <div>지도 화면</div>
            <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.7 }}>
              주변 화장실 위치가 표시됩니다
            </div>
          </div>
        </div>

        {/* Toilet List */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', margin: '0 0 15px 0' }}>
            가까운 화장실
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '15px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '5px', fontSize: '14px' }}>
                    종로구청 공용화장실
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    서울시 종로구 세종대로 110
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#007AFF', fontWeight: '600', fontSize: '14px' }}>120m</div>
                  <div style={{ fontSize: '11px', color: '#4CAF50' }}>24시간</div>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '15px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '5px', fontSize: '14px' }}>
                    광화문광장 화장실
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    서울시 종로구 세종대로 175
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#007AFF', fontWeight: '600', fontSize: '14px' }}>250m</div>
                  <div style={{ fontSize: '11px', color: '#FF9500' }}>06:00-22:00</div>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '15px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '5px', fontSize: '14px' }}>
                    경복궁 매표소 화장실
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    서울시 종로구 사직로 161
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#007AFF', fontWeight: '600', fontSize: '14px' }}>380m</div>
                  <div style={{ fontSize: '11px', color: '#4CAF50' }}>♿ 장애인</div>
                </div>
              </div>
            </div>
          </div>
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

export default ToiletPage;
