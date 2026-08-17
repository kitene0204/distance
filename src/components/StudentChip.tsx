import React, { useState } from 'react';
import { Student, DistanceCategory, CATEGORIES } from '../types';
import { MessageSquare, X, ArrowRightLeft, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface StudentChipProps {
  student: Student;
  currentCategory?: DistanceCategory | null;
  reason?: string;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, student: Student) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemove?: (studentId: string) => void;
  onEditReason?: (student: Student, currentCategory: DistanceCategory) => void;
  onQuickMove?: (student: Student, targetCategory: DistanceCategory) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const StudentChip: React.FC<StudentChipProps> = ({
  student,
  currentCategory,
  reason,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onRemove,
  onEditReason,
  onQuickMove,
  size = 'md',
  disabled = false
}) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({
      studentId: student.id,
      fromCategory: currentCategory || null
    }));
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) {
      onDragStart(e, student);
    }
  };

  const isBoy = student.gender === '남';

  // Base styles matching Clean Minimalism theme
  // Boy badge: soft indigo, Girl badge: soft rose
  const genderBadgeClasses = isBoy
    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/90 font-medium'
    : 'bg-rose-50 text-rose-700 border border-rose-200/90 font-medium';

  return (
    <div className="relative inline-block select-none group">
      <motion.div
        id={`student-chip-${student.id}`}
        draggable={!disabled}
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={`
          relative flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-2xs transition-all cursor-grab active:cursor-grabbing
          bg-white text-slate-800
          ${isDragging ? 'opacity-40 border-dashed border-indigo-400 scale-95' : 'hover:border-slate-300 border-slate-200/90'}
          ${currentCategory ? 'pr-2' : ''}
        `}
      >
        {/* Gender Badge */}
        <span
          className={`
            inline-flex items-center justify-center text-[10px] px-1.5 py-0.2 rounded min-w-[18px] text-center
            ${genderBadgeClasses}
          `}
        >
          {student.gender}
        </span>

        {/* Student Name */}
        <span className="text-sm font-medium tracking-tight text-slate-800 whitespace-nowrap">
          {student.name}
        </span>

        {/* Reason Indicator Icon (if placed and has reason) */}
        {currentCategory && (
          <div className="flex items-center gap-1 ml-0.5">
            {reason ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditReason?.(student, currentCategory);
                }}
                className="p-1 rounded hover:bg-slate-100 text-indigo-600 transition-colors"
                title={`작성한 이유: "${reason}" (클릭하여 수정)`}
              >
                <MessageSquare className="w-3.5 h-3.5 fill-indigo-100 stroke-indigo-600" />
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditReason?.(student, currentCategory);
                }}
                className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-colors"
                title="이유 추가하기"
              >
                <MessageSquare className="w-3.5 h-3.5 stroke-slate-400" />
              </button>
            )}

            {/* Quick remove from category button */}
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(student.id);
                }}
                className="p-1 rounded hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-colors"
                title="친구 목록으로 되돌리기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Touch & Quick Action helper toggle */}
        {!disabled && onQuickMove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickMenu(!showQuickMenu);
            }}
            className="md:hidden ml-1 p-0.5 text-slate-400 hover:text-slate-600"
            title="이동하기"
          >
            <ArrowRightLeft className="w-3 h-3" />
          </button>
        )}
      </motion.div>

      {/* Quick Move Dropdown (especially helpful for touch devices / mobile) */}
      {showQuickMenu && onQuickMove && (
        <div
          className="absolute z-30 left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 text-xs animate-in fade-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-semibold px-2 py-1 text-slate-500 border-b border-slate-100 mb-1 flex items-center justify-between">
            <span>{student.name} 이동하기</span>
            <button
              onClick={() => setShowQuickMenu(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          {(['close', 'medium', 'far'] as DistanceCategory[]).map((catId) => {
            const cat = CATEGORIES[catId];
            const isCurrent = currentCategory === catId;
            return (
              <button
                key={catId}
                type="button"
                disabled={isCurrent}
                onClick={() => {
                  setShowQuickMenu(false);
                  onQuickMove(student, catId);
                }}
                className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                  isCurrent
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'hover:bg-slate-50 text-slate-700 font-medium'
                }`}
              >
                <span>{cat.title}</span>
                {isCurrent && <span className="text-[10px] text-slate-400">현재 위치</span>}
              </button>
            );
          })}

          {currentCategory && onRemove && (
            <button
              type="button"
              onClick={() => {
                setShowQuickMenu(false);
                onRemove(student.id);
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 font-medium mt-1 border-t border-slate-100"
            >
              친구 목록으로 되돌리기
            </button>
          )}
        </div>
      )}
    </div>
  );
};
