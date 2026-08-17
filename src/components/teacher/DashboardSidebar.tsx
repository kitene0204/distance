import React from 'react';
import { Student, StudentScoreStats } from '../../types';
import { Sparkles, Info } from 'lucide-react';

interface DashboardSidebarProps {
  totalClosenessScore: number;
  totalAttentionScore: number;
  topPreferences: StudentScoreStats[];
  topDispreferences: StudentScoreStats[];
  onSelectStudent: (student: Student) => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  totalClosenessScore,
  totalAttentionScore,
  topPreferences,
  topDispreferences,
  onSelectStudent,
}) => {
  const getMedal = (index: number) => {
    if (index === 0) return <span className="text-amber-500 font-bold text-sm">🥇</span>;
    if (index === 1) return <span className="text-slate-400 font-bold text-sm">🥈</span>;
    if (index === 2) return <span className="text-amber-700 font-bold text-sm">🥉</span>;
    return <span className="text-xs font-semibold text-slate-500 w-4 text-center">{index + 1}</span>;
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-4">
      {/* 1. Score Summary Card matching Image 1 & 2 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <span>🌟</span>
            <span>우리 반 끈끈이 점수</span>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-sky-500 text-right mt-1 tracking-tight">
            {totalClosenessScore}점
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <span>🌟</span>
            <span>우리 반 관심 점수</span>
          </div>
          <div className="text-2xl font-black text-sky-500 text-right mt-1 tracking-tight">
            {totalAttentionScore}점
          </div>
        </div>
      </div>

      {/* 2. 선호도 TOP 5 matching Image 1, 2, 4 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <h3 className="font-bold text-xs sm:text-sm text-slate-900 mb-3 flex items-center justify-between">
          <span>선호도 TOP 5</span>
        </h3>

        <div className="space-y-2.5">
          {topPreferences.map((stat, idx) => (
            <div
              key={stat.student.id}
              onClick={() => onSelectStudent(stat.student)}
              className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 flex justify-center">{getMedal(idx)}</div>
                <span className="text-xs font-bold text-slate-800">{stat.student.name}</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                ({stat.preferenceCount}점)
              </span>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-slate-400 mt-4 leading-relaxed border-t border-slate-100 pt-2.5">
          * 친한 친구 또는 친해지고 싶은 친구로 평가를 많이 받은 학생들을 보여줍니다.
        </p>
      </div>

      {/* 3. 비선호도 TOP 5 matching Image 4 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <h3 className="font-bold text-xs sm:text-sm text-slate-900 mb-3 flex items-center justify-between">
          <span>비선호도 TOP 5</span>
        </h3>

        <div className="space-y-2.5">
          {topDispreferences.map((stat, idx) => (
            <div
              key={stat.student.id}
              onClick={() => onSelectStudent(stat.student)}
              className="flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 flex justify-center">{getMedal(idx)}</div>
                <span className="text-xs font-bold text-slate-800">{stat.student.name}</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                ({stat.dispreferenceCount}점)
              </span>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-slate-400 mt-4 leading-relaxed border-t border-slate-100 pt-2.5">
          * 같이 있으면 불편하다고 평가받은 학생을 보여줍니다.
        </p>
      </div>
    </aside>
  );
};
