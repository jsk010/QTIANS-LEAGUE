
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { BibleEntry } from './types';

// 메인 스프레드시트 URL
const PRIMARY_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwfPZ3rSvJihXJP8dwu7ZiV-vEZWYlzTkIMb3jxeaI-GouNVBwvzUrGWFbP4kt1lYNf/exec';

// 백업용 제2 스프레드시트 URL
const BACKUP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxPOG9fi1edLvDh7hiG8ilfiGjpoJG3YKgY99l3HeP57IZ2gxkS--Q__G3758lGOECi/exec'; 

/**
 * 날짜 형식을 YYYY-MM-DD로 통일하는 유틸리티
 */
const normalizeDate = (dateStr: string) => {
  if (!dateStr) return '';
  // 숫자만 추출해서 -로 연결 (예: 2026. 01. 22 -> 2026-01-22)
  const nums = dateStr.match(/\d+/g);
  if (nums && nums.length >= 3) {
    const y = nums[0];
    const m = nums[1].padStart(2, '0');
    const d = nums[2].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return dateStr.trim();
};

const App: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');
  const [chapel, setChapel] = useState('');
  const [village, setVillage] = useState('');
  const [scripture, setScripture] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'syncing' | 'done'>('idle');
  const [history, setHistory] = useState<BibleEntry[]>([]);

  // DB에서 전체 데이터 가져오기
  const fetchHistory = async () => {
    setIsSyncing(true);
    try {
      // 캐시 방지를 위해 타임스탬프 쿼리 추가
      const response = await fetch(`${PRIMARY_SCRIPT_URL}?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          // 서버 데이터의 날짜와 문자열을 정규화하여 저장
          const normalizedData = data.map(entry => ({
            ...entry,
            date: normalizeDate(entry.date),
            chapel: entry.chapel?.trim() || '',
            village: entry.village?.trim() || ''
          }));
          setHistory(normalizedData);
          localStorage.setItem('qt_history', JSON.stringify(normalizedData));
        }
      }
    } catch (err) {
      console.warn("DB 동기화 실패 (로컬 데이터 사용):", err);
      const savedHistory = localStorage.getItem('qt_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    
    const lastInfo = localStorage.getItem('qt_last_info');
    if (lastInfo) {
      try {
        const { name, chapel, village } = JSON.parse(lastInfo);
        setName(name || '');
        setChapel(chapel || '');
        setVillage(village || '');
      } catch (e) {
        console.error("Failed to parse last info", e);
      }
    }
  }, []);

  // 상세 통계 계산
  const detailedStats = useMemo(() => {
    const targetDate = normalizeDate(date);
    const filtered = history.filter(entry => normalizeDate(entry.date) === targetDate);
    
    const chapels = ["본당 중등부", "본당 고등부", "학교 중등부", "학교 고등부"];
    const villages = ["1마을", "2마을", "3마을"];

    const result: Record<string, Record<string, number>> = {};
    
    chapels.forEach(c => {
      result[c] = {};
      villages.forEach(v => {
        result[c][v] = 0;
      });
    });

    filtered.forEach(entry => {
      const c = entry.chapel;
      const v = entry.village;
      if (result[c] && result[c][v] !== undefined) {
        result[c][v]++;
      }
    });

    return { data: result, total: filtered.length };
  }, [history, date]);

  const sendToSheet = async (url: string, params: URLSearchParams) => {
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setBackupStatus('syncing');

    const params = new URLSearchParams();
    params.append('date', date);
    params.append('name', name);
    params.append('chapel', chapel);
    params.append('village', village);
    params.append('scripture', scripture);

    try {
      const primaryTask = sendToSheet(PRIMARY_SCRIPT_URL, params);
      let backupTask = Promise.resolve(true);
      if (BACKUP_SCRIPT_URL && BACKUP_SCRIPT_URL.startsWith('https')) {
        backupTask = sendToSheet(BACKUP_SCRIPT_URL, params);
      }

      await Promise.all([primaryTask, backupTask]);
      
      // 전송 성공 후 즉시 DB 리프레시
      await fetchHistory();
      
      localStorage.setItem('qt_last_info', JSON.stringify({ name, chapel, village }));
      setSuccess(true);
      setBackupStatus('done');
      setScripture('');
      
      setTimeout(() => {
        setSuccess(false);
        setBackupStatus('idle');
      }, 5000);
    } catch (err) {
      alert("전송 중 문제가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const villageColors: Record<string, string> = {
    "1마을": "bg-blue-500",
    "2마을": "bg-emerald-500",
    "3마을": "bg-purple-500"
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        
        {/* 입력 폼 섹션 */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 p-8 md:p-12 border border-slate-100 transition-all relative overflow-hidden">
          {(isSubmitting || isSyncing) && (
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 overflow-hidden">
              <div className="h-full bg-blue-600 animate-[progress_2s_ease-in-out_infinite] origin-left w-1/2"></div>
            </div>
          )}
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">성경 읽기 기록</h3>
              {(backupStatus === 'syncing' || isSyncing) && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Synchronizing DB...</p>
                </div>
              )}
            </div>
            {success && (
              <div className="bg-green-50 text-green-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 animate-bounce">
                <i className="fa-solid fa-check-double"></i>
                서버 저장 완료
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">기록 날짜</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-slate-900 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">이름</label>
                <input 
                  type="text" 
                  placeholder="이름을 입력하세요"
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-slate-900 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">소속 예배당</label>
                <select 
                  value={chapel} 
                  onChange={(e) => setChapel(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-slate-900 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>예배당을 선택하세요</option>
                  <option value="본당 중등부">본당 중등부</option>
                  <option value="본당 고등부">본당 고등부</option>
                  <option value="학교 중등부">학교 중등부</option>
                  <option value="학교 고등부">학교 고등부</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">마을(촌)</label>
                <select 
                  value={village} 
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-slate-900 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>마을을 선택하세요</option>
                  <option value="1마을">1마을</option>
                  <option value="2마을">2마을</option>
                  <option value="3마을">3마을</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">본문 및 묵상 내용</label>
              <textarea 
                rows={6}
                placeholder="오늘 읽은 성경 구절은 어디인가요? 묵상한 내용을 자유롭게 기록해주세요"
                value={scripture} 
                onChange={(e) => setScripture(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-[2rem] px-6 py-5 text-slate-900 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium placeholder:text-slate-300 resize-none leading-relaxed"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-5 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-lg ${
                isSubmitting 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-slate-900 text-white hover:bg-black hover:shadow-2xl hover:-translate-y-1 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  저장 중...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane text-sm"></i>
                  묵상 기록 제출하기
                </>
              )}
            </button>
          </form>
        </div>

        {/* 인포그래픽 섹션 */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-900/20 text-white space-y-12">
          <div className="flex items-center justify-between border-b border-slate-800 pb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xl md:text-3xl font-black tracking-tight whitespace-nowrap">오늘의 QT 현황</h4>
                {isSyncing && <i className="fa-solid fa-rotate animate-spin text-blue-500 text-sm"></i>}
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                DETAILED QT STATS (LIVE)
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Records</p>
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-4xl md:text-5xl font-black text-white">{detailedStats.total}</span>
                <span className="text-blue-500 text-sm font-bold ml-1">건</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {Object.entries(detailedStats.data).map(([chapelName, villageData]) => {
              const chapelTotal = Object.values(villageData).reduce((a, b) => a + b, 0);

              return (
                <div key={chapelName} className="bg-slate-800/40 rounded-3xl p-6 border border-slate-800 hover:border-slate-700 transition-all group">
                  <div className="flex justify-between items-center mb-6">
                    <h5 className="text-lg font-black text-slate-100 group-hover:text-blue-400 transition-colors">{chapelName}</h5>
                    <span className="bg-slate-900/50 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      Total: {chapelTotal}
                    </span>
                  </div>

                  <div className="space-y-5">
                    {Object.entries(villageData).map(([vName, count]) => {
                      const percentage = chapelTotal > 0 ? (count / chapelTotal) * 100 : 0;
                      
                      return (
                        <div key={vName} className="space-y-2">
                          <div className="flex justify-between items-center text-[11px] font-bold">
                            <span className="text-slate-400 flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${villageColors[vName]}`}></span>
                              {vName}
                            </span>
                            <span className="text-white text-sm">{count} <span className="text-[10px] text-slate-500">명</span></span>
                          </div>
                          <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden flex">
                            <div 
                              className={`${villageColors[vName]} h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_10px_rgba(59,130,246,0.2)]`}
                              style={{ width: `${count > 0 ? Math.max(percentage, 5) : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {detailedStats.total === 0 && !isSyncing && (
            <div className="text-center py-10">
              <p className="text-slate-500 font-bold italic">해당 날짜에 기록된 데이터가 없습니다.</p>
            </div>
          )}
          
          <div className="pt-4 flex flex-wrap gap-6 justify-center">
            {["1마을", "2마을", "3마을"].map(v => (
              <div key={v} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${villageColors[v]}`}></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{v}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button 
              onClick={fetchHistory}
              disabled={isSyncing}
              className="group text-[10px] text-slate-500 hover:text-blue-400 transition-colors font-bold uppercase tracking-[0.2em] flex items-center gap-2 mx-auto px-4 py-2 bg-slate-800/20 rounded-full"
            >
              <i className={`fa-solid fa-arrows-rotate ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}></i>
              Manual DB Refresh
            </button>
          </div>
        </div>

        <div className="pt-8 text-center">
          <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4">
            <span className="w-12 h-[1px] bg-slate-100"></span>
            Faith Persistence System
            <span className="w-12 h-[1px] bg-slate-100"></span>
          </p>
        </div>

      </div>
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%) scaleX(0.2); }
          50% { transform: translateX(0%) scaleX(0.5); }
          100% { transform: translateX(100%) scaleX(0.2); }
        }
      `}</style>
    </Layout>
  );
};

export default App;
