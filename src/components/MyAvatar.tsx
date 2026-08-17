import React from 'react';
import { motion } from 'motion/react';
import { Student } from '../types';
import { UserCheck, Sparkles } from 'lucide-react';

interface MyAvatarProps {
  currentStudent?: Student | null;
  onSelectCurrentStudent?: () => void;
  placedCount: number;
  totalCount: number;
}

export const MyAvatar: React.FC<MyAvatarProps> = ({
  currentStudent,
  onSelectCurrentStudent,
  placedCount,
  totalCount,
}) => {
  const isAllPlaced = placedCount > 0 && placedCount === totalCount;

  return (
    <div id="my-avatar-container" className="flex flex-col items-center justify-center p-3 select-none">
      <motion.div
        className="relative group cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSelectCurrentStudent}
        title={currentStudent ? `현재 검사자: ${currentStudent.name} (클릭하여 변경)` : '검사자 선택'}
      >
        {/* Decorative Mascot SVG matching Clean Minimalism */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center relative">
          <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-xs">
            {/* Background Ribbon Legs */}
            <path
              d="M52 115 L36 142 L56 135 L66 140 L60 115 Z"
              fill="#6366f1"
              opacity="0.9"
            />
            <path
              d="M108 115 L124 142 L104 135 L94 140 L100 115 Z"
              fill="#818cf8"
              opacity="0.9"
            />

            {/* Starburst / Flower Rosette Body */}
            <g transform="translate(80, 72)">
              <path
                d="M 0 -48 
                   L 14 -38 L 34 -45 L 38 -25 L 54 -18 L 46 2 L 53 23 L 36 34 L 32 54 L 12 49 L -2 60 L -16 49 L -36 54 L -40 34 L -56 23 L -48 2 L -56 -18 L -38 -25 L -34 -45 L -14 -38 Z"
                fill="#e0e7ff"
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Inner Soft Glow */}
              <circle cx="0" cy="2" r="34" fill="#c7d2fe" opacity="0.6" />

              {/* Eyes */}
              <circle cx="-13" cy="-2" r="2.5" fill="#1e293b" />
              <circle cx="13" cy="-2" r="2.5" fill="#1e293b" />

              {/* Cheeks */}
              <circle cx="-20" cy="5" r="4" fill="#f43f5e" opacity="0.35" />
              <circle cx="20" cy="5" r="4" fill="#f43f5e" opacity="0.35" />

              {/* Warm Smile Mouth */}
              <path
                d="M -14 5 Q 0 18 14 5"
                fill="none"
                stroke="#1e293b"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </g>
          </svg>

          {isAllPlaced && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </motion.div>
          )}
        </div>

        {/* Change Student Badge */}
        {onSelectCurrentStudent && (
          <button
            type="button"
            className="absolute -bottom-1 right-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap flex items-center gap-1"
          >
            <UserCheck className="w-3 h-3" />
            변경
          </button>
        )}
      </motion.div>

      {/* Label "나" */}
      <h2 className="mt-2 text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
        나
      </h2>

      {/* Tester Student Name Tag */}
      {currentStudent ? (
        <div className="mt-1 flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 transition-colors">
          <span
            className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold ${
              currentStudent.gender === '남'
                ? 'bg-indigo-500 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            {currentStudent.gender}
          </span>
          <span>{currentStudent.name}</span>
        </div>
      ) : (
        <button
          onClick={onSelectCurrentStudent}
          className="mt-1 text-xs text-indigo-600 hover:text-indigo-700 underline font-medium"
        >
          검사자 지정하기
        </button>
      )}

      {/* Progress pill */}
      <div className="mt-2.5 text-center">
        <span className="inline-block text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
          배치 {placedCount} / {totalCount}명
        </span>
      </div>
    </div>
  );
};
