
import React from 'react';
import { AIInsight } from '../types';

interface Props {
  insight: AIInsight;
}

export const AIReflectionCard: React.FC<Props> = ({ insight }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-[2.5rem] p-8 md:p-12 border border-blue-100 shadow-xl shadow-blue-900/5 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
          <i className="fa-solid fa-sparkles text-xl"></i>
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">AI 영성 가이드</h3>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Personal Reflection Guide</p>
        </div>
      </div>
      
      <div className="grid gap-8">
        <div className="space-y-3">
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            오늘의 묵상 피드백
          </h4>
          <p className="text-slate-700 leading-relaxed font-medium text-lg whitespace-pre-wrap">{insight.meditation}</p>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            마음을 담은 기도
          </h4>
          <div className="bg-white/40 p-6 rounded-2xl border border-indigo-50 italic text-slate-600 leading-relaxed">
            "{insight.prayer}"
          </div>
        </div>
        
        <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-lg shadow-blue-600/20">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200 mb-2">추천 성경 구절</h4>
          <p className="text-2xl font-black tracking-tight">{insight.verseSuggestion}</p>
        </div>
      </div>
    </div>
  );
};
