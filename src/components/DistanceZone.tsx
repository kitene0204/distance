import React, { useState } from 'react';
import { DistanceCategory, Student, PlacedStudent, CATEGORIES } from '../types';
import { StudentChip } from './StudentChip';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDown, Smile, Meh, Frown } from 'lucide-react';

interface DistanceZoneProps {
  category: DistanceCategory;
  students: Student[];
  placements: Record<string, PlacedStudent>;
  onDropStudent: (studentId: string, category: DistanceCategory) => void;
  onRemoveStudent: (studentId: string) => void;
  onEditReason: (student: Student, category: DistanceCategory) => void;
  onQuickMove: (student: Student, targetCategory: DistanceCategory) => void;
  isDragActive?: boolean;
}

export const DistanceZone: React.FC<DistanceZoneProps> = ({
  category,
  students,
  placements,
  onDropStudent,
  onRemoveStudent,
  onEditReason,
  onQuickMove,
  isDragActive = false
}) => {
  const [isOver, setIsOver] = useState(false);
  const meta = CATEGORIES[category];

  // Filter students placed in this category
  const placedStudents = students.filter(
    (s) => placements[s.id]?.category === category
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Check if target is still within this container
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
        onDropStudent(data.studentId, category);
      }
    } catch (err) {
      console.error('Failed to parse dropped student', err);
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'close':
        return <Smile className="w-4 h-4 text-indigo-600" />;
      case 'medium':
        return <Meh className="w-4 h-4 text-slate-600" />;
      case 'far':
        return <Frown className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div
      id={`distance-zone-${category}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative flex flex-col flex-1 min-h-[360px] sm:min-h-[420px] rounded-xl border transition-all duration-200
        ${meta.colorTheme.bg}
        ${isOver ? meta.colorTheme.borderActive + ' shadow-sm' : meta.colorTheme.border}
        ${isDragActive && !isOver ? 'border-dashed' : ''}
      `}
    >
      {/* Category Header */}
      <div className="p-3.5 sm:p-4 text-center border-b border-slate-200/80 bg-white/60 rounded-t-xl select-none">
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          {getCategoryIcon()}
          <h3 className={`text-base sm:text-lg font-bold ${meta.colorTheme.textColor}`}>
            {meta.title}
          </h3>
          {placedStudents.length > 0 && (
            <span
              className={`ml-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${meta.colorTheme.badgeBg}`}
            >
              {placedStudents.length}명
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 font-normal">
          {meta.subtitle}
        </p>
      </div>

      {/* Placed Students Content Area */}
      <div className="flex-1 p-3.5 flex flex-col">
        {placedStudents.length === 0 ? (
          <div
            className={`
              flex-1 flex flex-col items-center justify-center p-4 text-center rounded-lg border border-dashed transition-colors
              ${isOver ? 'border-indigo-400 bg-white/80 text-indigo-700' : 'border-slate-200 text-slate-400'}
            `}
          >
            <ArrowDown
              className={`w-5 h-5 mb-1.5 opacity-60 ${
                isOver ? 'text-indigo-600 animate-bounce' : 'text-slate-400'
              }`}
            />
            <p className="text-xs sm:text-sm font-medium">
              {isOver ? '여기에 놓으세요' : '친구를 드래그해서 배치하세요'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              (터치 기기는 칩의 메뉴 버튼으로도 이동 가능)
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 content-start min-h-[140px]">
            <AnimatePresence>
              {placedStudents.map((student) => {
                const placement = placements[student.id];
                return (
                  <motion.div
                    key={student.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                  >
                    <StudentChip
                      student={student}
                      currentCategory={category}
                      reason={placement?.reason}
                      onRemove={onRemoveStudent}
                      onEditReason={onEditReason}
                      onQuickMove={onQuickMove}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Drop Zone Active Overlay Indicator */}
      {isOver && (
        <div className="absolute inset-0 rounded-xl bg-indigo-500/5 pointer-events-none flex items-center justify-center border-2 border-indigo-400">
          <div className="bg-white px-3.5 py-1.5 rounded-lg shadow-sm border border-indigo-200 text-indigo-700 font-semibold text-xs">
            {meta.title}에 배치
          </div>
        </div>
      )}
    </div>
  );
};
