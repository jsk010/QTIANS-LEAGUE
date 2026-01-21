
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { BibleEntry } from './types';

// 메인 스프레드시트 URL (기존 시트)
const PRIMARY_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwfPZ3rSvJihXJP8dwu7ZiV-vEZWYlzTkIMb3jxeaI-GouNVBwvzUrGWFbP4kt1lYNf/exec';

// 백업용 제2 스프레드시트 URL (새로 만든 시트의 URL)
const BACKUP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxPOG9fi1edLvDh7hiG8ilfiGjpoJG3YKgY99l3HeP57IZ2gxkS--Q__G3758lGOECi/exec'; 

const App: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');
  const [chapel, setChapel] = useState('');
  const [village, setVillage] = useState('');
  const [scripture, setScripture] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'syncing' | 'done'>('idle');
  const [history, setHistory] = useState<BibleEntry[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('qt_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    
    const lastInfo = localStorage.getItem('qt_last_info');
    if (lastInfo) {
      const { name, chapel, village } = JSON.parse(lastInfo);
      setName(name || '');
      setChapel(chapel || '');
      setVillage(village || '');
    }
  }, []);

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
      console.error(`Failed to send to ${url}`, err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!PRIMARY_SCRIPT_URL || (!PRIMARY_SCRIPT_URL.includes('AKfycb') && !PRIMARY_SCRIPT_URL.includes('https'))) {
      alert("스프레드시트 URL 설정을 확인해주세요.");
      return;
    }

    setIsSubmitting(true);
    setBackupStatus('syncing');

    const params = new URLSearchParams();
    params.append('date', date);
    params.append('name', name);
    params.append('chapel', chapel);
    params.append('village', village);
    params.append('scripture', scripture);

    const newEntry: BibleEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date,
      name,
      chapel,
      village,
      scripture,
      timestamp: Date.now()
    };

    try {
      const primaryTask = sendToSheet(PRIMARY_SCRIPT_URL, params);
      
      let backupTask = Promise.resolve(true);
      if (BACKUP_SCRIPT_URL && !BACKUP_SCRIPT_URL.includes('Your_New_Backup_URL')) {
        backupTask = sendToSheet(BACKUP_SCRIPT_URL, params);
      }

      await Promise.all([primaryTask, backupTask]);
      
      const updatedHistory = [newEntry, ...history].slice(0, 50);
      setHistory(updatedHistory);
      localStorage.setItem('qt_history', JSON.stringify(updatedHistory));
      localStorage.setItem('qt_last_info', JSON.stringify({ name, chapel, village }));

      setSuccess(true);
      setBackupStatus('done');
      setScripture('');
      
      setTimeout(() => {
        setSuccess(false);
        setBackupStatus('idle');
      }, 5000);
    } catch (err) {
      console.error("Submission Error:", err);
      alert("전송 중 문제가 발생했습니다. 네트워크 상태를 확인하세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `qt_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-12">
        
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 p-8 md:p-12 border border-slate-100 transition-all relative overflow-hidden">
          {isSubmitting && (
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 overflow-hidden">
              <div className="h-full bg-blue-600 animate-[progress_2s_ease-in-out_infinite] origin-left w-1/2"></div>
            </div>
          )}
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">성경 읽기 기록</h3>
              {backupStatus === 'syncing' && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></div>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Cloud Syncing...</p>
                </div>
              )}
            </div>
            {success && (
              <div className="bg-green-50 text-green-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 animate-bounce">
                <i className="fa-solid fa-check-double"></i>
                완전 저장됨
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
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">성함</label>
                <input 
                  type="text" 
                  placeholder="성함을 입력하세요"
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
                <input 
                  type="text" 
                  placeholder="예: 본당 고등부"
                  value={chapel} 
                  onChange={(e) => setChapel(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-slate-900 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold placeholder:text-slate-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">마을</label>
                <input 
                  type="text" 
                  placeholder="1마을"
                  value={village} 
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-slate-900 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">본문 및 묵상 내용</label>
              <textarea 
                rows={6}
                placeholder="오늘 읽은 성경 구절은 어디인가요? 묵상한 내용을 자유롭게 기도해주세요"
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
                  이중 클라우드 동기화 중...
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

        {history.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <i className="fa-solid fa-clock-rotate-left text-blue-600 text-sm"></i>
                최근 나의 기록
              </h4>
              <button 
                onClick={downloadBackup}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 group"
              >
                <i className="fa-solid fa-download group-hover:bounce"></i>
                파일로 내보내기
              </button>
            </div>
            
            <div className="grid gap-4">
              {history.map((entry) => (
                <div key={entry.id} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group border-l-4 border-l-transparent hover:border-l-blue-500">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                        {entry.date}
                      </span>
                      <span className="text-slate-900 font-bold text-sm">{entry.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-300 font-medium italic">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-3 group-hover:line-clamp-none transition-all duration-500 leading-relaxed whitespace-pre-wrap font-medium">
                    {entry.scripture}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

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
