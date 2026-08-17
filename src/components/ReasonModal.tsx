import React, { useState, useEffect, useRef } from 'react';
import { Student, DistanceCategory, CATEGORIES } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ReasonModalProps {
  isOpen: boolean;
  student: Student | null;
  category: DistanceCategory | null;
  initialReason?: string;
  isEditMode?: boolean;
  onSave: (reason: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

export const ReasonModal: React.FC<ReasonModalProps> = ({
  isOpen,
  student,
  category,
  initialReason = '',
  isEditMode = false,
  onSave,
  onSkip,
  onClose
}) => {
  const [reason, setReason] = useState(initialReason);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setReason(initialReason);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialReason]);

  if (!isOpen || !student || !category) return null;

  const meta = CATEGORIES[category];
  const isBoy = student.gender === '남';
  const genderBadgeClasses = isBoy
    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium'
    : 'bg-rose-50 text-rose-700 border border-rose-200 font-medium';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSave(reason.trim());
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-white rounded-xl shadow-xl p-6 sm:p-7 border border-slate-200 overflow-hidden z-10"
        >
          {/* Header Category Title */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {meta.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {meta.title}로 선택한 친구
            </p>

            {/* Selected Friend Badge */}
            <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${genderBadgeClasses}`}>
                {student.gender}
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {student.name}
              </span>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="mb-4">
            <label
              htmlFor="reason-textarea"
              className="block text-sm font-semibold text-slate-800 mb-2"
            >
              {meta.reasonPrompt}
            </label>

            {/* Textarea Input */}
            <div className="relative">
              <textarea
                id="reason-textarea"
                ref={textareaRef}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={meta.reasonPlaceholder}
                rows={4}
                className="w-full p-3.5 text-sm text-slate-800 placeholder-slate-400 bg-white rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all resize-none leading-relaxed"
              />
              <div className="absolute bottom-2.5 right-3 text-[11px] text-slate-400">
                {reason.length}자
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-2">
            {/* Left: 건너뛰기 Button */}
            <button
              type="button"
              onClick={onSkip}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              건너뛰기
            </button>

            {/* Right: 닫기 & 등록하기 Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={() => onSave(reason.trim())}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-2xs transition-colors"
              >
                {isEditMode ? '수정하기' : '등록하기'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
