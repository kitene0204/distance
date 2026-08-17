import React, { useState } from 'react';
import { Student } from '../types';
import { Users, LayoutDashboard, HelpCircle, Heart, User, Check } from 'lucide-react';

interface HeaderNavProps {
  className: string;
  currentStudent: Student | null;
  placedCount: number;
  totalCount: number;
  onOpenRosterManager: () => void;
  onOpenTeacherDashboard: () => void;
  onOpenSelectTester: () => void;
  onResetTest: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  className,
  currentStudent,
  placedCount,
  totalCount,
  onOpenRosterManager,
  onOpenTeacherDashboard,
  onOpenSelectTester,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* App Title & Class Badge */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                  우리반 마음거리 검사
                </h1>
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  {className}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                친구들과 나의 마음 거리를 솔직하게 표현해보는 시간
              </p>
            </div>
          </div>

          {/* Mobile Current Student Indicator */}
          <button
            type="button"
            onClick={onOpenSelectTester}
            className="sm:hidden text-xs font-medium px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-indigo-500" />
            <span>{currentStudent?.name || '선택'}</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
          {/* Current Tester Switcher (Desktop) */}
          <button
            type="button"
            onClick={onOpenSelectTester}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
            title="검사자 변경"
          >
            <span className="text-slate-400">검사자:</span>
            {currentStudent ? (
              <span className="flex items-center gap-1.5 text-indigo-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                {currentStudent.name}
              </span>
            ) : (
              <span className="text-slate-500">학생 선택</span>
            )}
          </button>

          {/* Roster Management */}
          <button
            type="button"
            onClick={onOpenRosterManager}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>명부 관리</span>
          </button>

          {/* Teacher Mode Dashboard */}
          <button
            type="button"
            onClick={onOpenTeacherDashboard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-300" />
            <span>교사용 결과함</span>
          </button>

          {/* Help button */}
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="검사 방법 도움말"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Help Banner Popup */}
      {showHelp && (
        <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 shadow-xs max-w-7xl mx-auto animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <h4 className="font-bold flex items-center gap-1.5 text-slate-900 text-sm">
                <Heart className="w-4 h-4 text-indigo-500" />
                마음거리 검사 진행 방법
              </h4>
              <p>1. 하단 [친구 목록]에서 친구를 마우스로 끌어(드래그) 알맞은 거리 상자에 놓아주세요.</p>
              <p>2. 친구를 넣으면 이유를 적는 창이 뜹니다. 이유를 적거나 [건너뛰기]를 누를 수 있습니다.</p>
              <p>3. 꼭 모든 친구를 옮기거나 억지로 먼거리 친구를 찾지 않아도 괜찮습니다.</p>
              <p>4. 분류를 마친 후 우측 하단의 [제출하기]를 눌러주세요.</p>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="text-slate-400 hover:text-slate-600 font-bold px-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
