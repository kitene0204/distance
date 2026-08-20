import React from 'react';
import { MainMenuType, Student } from '../types';
import { Sparkles, Users, ClipboardCheck, Network, TrendingUp, MessageSquare, ChevronDown, User } from 'lucide-react';

interface MainNavbarProps {
  activeNav: MainMenuType;
  onNavChange: (nav: MainMenuType) => void;
  classNameStr: string;
  selectedRound: number;
  onRoundChange: (r: number) => void;
  currentStudent: Student | null;
  onOpenSelectTester: () => void;
  onOpenTeacherDashboardModal: () => void;
}

export const MainNavbar: React.FC<MainNavbarProps> = ({
  activeNav,
  onNavChange,
  classNameStr,
  selectedRound,
  onRoundChange,
  currentStudent,
  onOpenSelectTester,
  onOpenTeacherDashboardModal,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Top bar with Brand Logo & User controls */}
        <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
          {/* Logo brand matching screenshots */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => onNavChange('multiround_report')}
          >
            {/* Custom cute 2-colored smiley icon */}
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-xs flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center relative overflow-hidden">
                {/* Left face orange, right face blue */}
                <div className="absolute inset-y-0 left-0 w-1/2 bg-amber-100/70 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-amber-600 mb-1" />
                </div>
                <div className="absolute inset-y-0 right-0 w-1/2 bg-sky-100/70 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-sky-600 mb-1" />
                </div>
                {/* Smiling curved line */}
                <div className="w-4 h-2 border-b-2 border-slate-800 rounded-b-full z-10 translate-y-1" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  우리반 관계 읽기
                </span>
                <span className="text-[11px] font-bold text-blue-600 tracking-tight hidden md:inline-block bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200">
                  AI기반 교우관계 분석 서비스
                </span>
              </div>
              <p className="text-[11px] text-slate-400 md:hidden">
                AI기반 교우관계 분석 서비스
              </p>
            </div>
          </div>

          {/* Right quick actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Current student tester switcher */}
            <button
              type="button"
              onClick={onOpenSelectTester}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
              title="검사 학생 변경"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline text-slate-500 font-normal">검사자:</span>
              <span className="text-slate-900 font-bold">{currentStudent?.name || '학생선택'}</span>
            </button>

            {/* Quick Link to Matrix & Universe Explorer */}
            <button
              type="button"
              onClick={onOpenTeacherDashboardModal}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>심층분석 뷰</span>
            </button>
          </div>
        </div>

        {/* Main Navigation Tabs Bar matching Screenshot top menu */}
        <nav className="flex items-center gap-1 sm:gap-6 overflow-x-auto py-1 scrollbar-none text-xs sm:text-sm font-bold">
          {/* 1. 학생회원관리 */}
          <button
            type="button"
            onClick={() => onNavChange('student_manager')}
            className={`py-3 px-2 sm:px-3 relative whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeNav === 'student_manager'
                ? 'text-blue-600 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>학생회원관리</span>
            {activeNav === 'student_manager' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          {/* 2. 교우관계진단관리 */}
          <button
            type="button"
            onClick={() => onNavChange('diagnostic_test')}
            className={`py-3 px-2 sm:px-3 relative whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeNav === 'diagnostic_test'
                ? 'text-blue-600 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>교우관계진단관리</span>
            {activeNav === 'diagnostic_test' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          {/* 3. 교우관계분석리포트 (Screenshot 2) */}
          <button
            type="button"
            onClick={() => onNavChange('relationship_report')}
            className={`py-3 px-2 sm:px-3 relative whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeNav === 'relationship_report'
                ? 'text-blue-600 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>교우관계분석리포트</span>
            {activeNav === 'relationship_report' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          {/* 4. 다회차분석리포트 (Screenshot 1) */}
          <button
            type="button"
            onClick={() => onNavChange('multiround_report')}
            className={`py-3 px-2 sm:px-3 relative whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeNav === 'multiround_report'
                ? 'text-blue-600 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>다회차분석리포트</span>
            {activeNav === 'multiround_report' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>

          {/* 5. 커뮤니티 */}
          <button
            type="button"
            onClick={() => onNavChange('community')}
            className={`py-3 px-2 sm:px-3 relative whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeNav === 'community'
                ? 'text-blue-600 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>커뮤니티</span>
            {activeNav === 'community' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
