
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { BibleEntry } from './types';

/**
 * [ 연동된 Google Spreadsheet Apps Script URL ]
 */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwaWviM9E1tHDkA-X_xv6ASMcu7yXOKAXW4y2Uc3l0ug410kZBGycAoOeRHBxgpOPZ9/exec';

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
    
    if (!SCRIPT_URL) {
      alert("배포된 Google Apps Script URL이 설정되지 않았습니다.");
      return;
    }

    setIsSubmitting(true);

    const params = new URLSearchParams();
    params.append('date', date);
    params.append('name', name);
    params.append('chapel', chapel);
    params.append('village', village);
    params.append('scripture', scripture);

    try {
      // Google Apps Script는 Redirect를 사용하므로 no-cors 모드로 전송합니다.
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });
      
      // no-cors 모드에서는 응답을 읽을 수 없으므로 fetch 호출이 성공하면 완료된 것으로 간주합니다.
      setSuccess(true);
      setName('');
      setScripture('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error("Submission Error:", err);
      alert("제출 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        
        {/* 성경 읽기 기록 폼 카드 */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 p-8 md:p-12 border border-slate-100">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">성경 읽기 제출</h3>
              <p className="text-slate-400 text-sm">오늘의 묵상을 기록하세요</p>
            </div>
            {success && (
              <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 animate-bounce">
                <i className="fa-solid fa-circle-check"></i>
                제출 완료!
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">날짜</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all font-medium cursor-pointer"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">성함</label>
                <input 
                  type="text" 
                  placeholder="성함을 입력하세요"
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">소속 예배당</label>
                <input 
                  type="text" 
                  placeholder="예: 비전랜드 1부"
                  value={chapel} 
                  onChange={(e) => setChapel(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder:text-slate-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">마을</label>
                <input 
                  type="text" 
                  placeholder="예: 사랑마을"
                  value={village} 
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">읽은 본문 및 묵상</label>
              </div>
              <textarea 
                rows={5}
                placeholder="오늘 읽은 성경 구절과 묵상한 내용을 자유롭게 기록해주세요."
                value={scripture} 
                onChange={(e) => setScripture(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-3xl px-6 py-5 text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder:text-slate-300 resize-none"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-5 rounded-3xl font-black text-lg transition-all flex items-center justify-center gap-3 ${
                isSubmitting 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-black hover:shadow-xl hover:-translate-y-1 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                  제출 중...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>
                  기록 제출하기
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </Layout>
  );
};

export default App;
