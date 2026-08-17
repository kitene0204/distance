import React, { useState } from 'react';
import { Student, DistanceCategory } from '../types';
import { StudentChip } from './StudentChip';
import { Users, Search, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RosterPoolProps {
  unassignedStudents: Student[];
  currentStudentId?: string | null;
  onDropToPool: (studentId: string) => void;
  onQuickMove: (student: Student, targetCategory: DistanceCategory) => void;
  onResetAll?: () => void;
  isDragActive?: boolean;
}

export const RosterPool: React.FC<RosterPoolProps> = ({
  unassignedStudents,
  currentStudentId,
  onDropToPool,
  onQuickMove,
  onResetAll,
  isDragActive = false
}) => {
  const [isOver, setIsOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | '남' | '여'>('all');

  // Filter out the current tester themselves from the list
  const availableStudents = unassignedStudents.filter(
    (s) => s.id !== currentStudentId
  );

  const filteredStudents = availableStudents.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = genderFilter === 'all' || student.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      if (data.studentId) {
        onDropToPool(data.studentId);
      }
    } catch (err) {
      console.error('Failed to parse dropped student to pool', err);
    }
  };

  return (
    <div
      id="roster-pool-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative rounded-xl border transition-all duration-200 bg-white p-4 sm:p-5 shadow-xs
        ${isOver ? 'border-indigo-400 ring-2 ring-indigo-100 bg-indigo-50/20' : 'border-slate-200'}
      `}
    >
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                친구 목록
              </h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                남은 친구 {availableStudents.length}명
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              (잘 모르겠으면 옮기지 않아도 괜찮아요 / 억지로 먼 거리 친구를 찾을 필요는 없습니다.)
            </p>
          </div>
        </div>

        {/* Search & Gender filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Gender Filter buttons */}
          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium border border-slate-200/60">
            <button
              type="button"
              onClick={() => setGenderFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                genderFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('남')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                genderFilter === '남'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              남학생
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('여')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                genderFilter === '여'
                  ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-rose-600'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              여학생
            </button>
          </div>

          {/* Quick search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="이름 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 w-28 sm:w-36 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>

          {/* Reset all button */}
          {onResetAll && (
            <button
              type="button"
              onClick={onResetAll}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="처음부터 다시하기"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Student List Chips */}
      <div className="min-h-[100px] flex flex-wrap gap-2.5 items-center content-start">
        {availableStudents.length === 0 ? (
          <div className="w-full py-6 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              우리반 모든 친구들이 위치에 배치되었습니다!
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              하단의 [제출하기] 버튼을 눌러 검사를 완료해주세요.
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="w-full py-4 text-center text-xs text-slate-400">
            검색 결과에 맞는 친구가 없습니다.
          </div>
        ) : (
          <AnimatePresence>
            {filteredStudents.map((student) => (
              <motion.div
                key={student.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
              >
                <StudentChip
                  student={student}
                  onQuickMove={onQuickMove}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Drop into pool helper */}
      {isOver && (
        <div className="absolute inset-0 rounded-2xl bg-sky-500/10 pointer-events-none flex items-center justify-center border-2 border-sky-400">
          <span className="bg-white px-3 py-1.5 rounded-lg shadow-sm text-sky-700 text-xs font-bold">
            친구 목록으로 복귀
          </span>
        </div>
      )}
    </div>
  );
};
