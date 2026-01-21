
import React, { useState } from 'react';
import { Layout } from './components/Layout';

/**
 * [ Google Spreadsheet Apps Script 설정 안내 ]
 * 1. 스프레드시트 -> 확장 프로그램 -> Apps Script 접속
 * 2. doPost(e) 함수에서 e.parameter.date를 시트 이름으로 사용하여 
 *    ss.insertSheet(date) 로직을 포함해야 날짜별 시트 생성이 가능합니다.
 */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwfPZ3rSvJihXJP8dwu7ZiV-vEZWYlzTkIMb3jxeaI-GouNVBwvzUrGWFbP4kt1lYNf/exec';

const App: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');
  const [chapel, setChapel] = useState('');
  const [village, setVillage] = useState('');
  const [scripture, setScripture] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!SCRIPT_URL || SCRIPT_URL.includes('PASTE_YOUR')) {
      alert("배포된 Google Apps Script URL을 설정해 주세요.");
      return;
    }

    setIsSubmitting(true);

    // 구글 앱스 스크립트에서 받을 파라미터 설정
    const params = new URLSearchParams();
    params.append('date', date); // 이 값이 시트의 이름이 됩니다.
    params.append('name', name);
    params.append('chapel', chapel);
    params.append('village', village);
    params.append('scripture', scripture);

    try {
      // no-cors 모드로 전송
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });
      
      setSuccess(true);
      setName('');
      setScripture('');
      
      // 성공 알림 후 5초 뒤 초기화
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error("Submission Error:", err);
      alert("전송 중 오류가 발생했습니다. Apps Script의 배포 상태를 확인해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 p-8 md:p-12 border border-slate-100 transition-all">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">성경 읽기 기록</h3>
              <p className="text-slate-400 mt-1 font-medium">선택하신 날짜의 시트 탭으로 저장됩니다</p>
            </div>
            {success && (
              <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
                <i className="fa-solid fa-check-circle"></i>
                제출 완료
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">날짜 (시트 이름)</label>
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
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">오늘 읽은 본문 및 묵상</label>
              <textarea 
                rows={6}
                placeholder="오늘 읽은 성경 구절은 어디인가요? 묵상한 내용을 자유롭게 기도해주세요"
                value={scripture} 
                onChange={(e) => setScripture(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-[2rem] px-6 py-5 text-slate-900 focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-medium placeholder:text-slate-300 resize-none"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-5 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200 ${
                isSubmitting 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-black hover:shadow-2xl hover:-translate-y-1 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  전송하는 중...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane text-sm"></i>
                  오늘의 묵상 기록하기
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3">
            <span className="w-8 h-[1px] bg-slate-200"></span>
            Ansan Dongsan Church Visionland
            <span className="w-8 h-[1px] bg-slate-200"></span>
          </p>
        </div>

      </div>
    </Layout>
  );
};

export default App;
