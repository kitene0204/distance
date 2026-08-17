import React from 'react';
import { Student } from '../types';
import { UserCheck, Sparkles, X } from 'lucide-react';
import { motion } from 'motion/react';

interface SelectTesterModalProps {
  isOpen: boolean;
  students: Student[];
  currentStudentId?: string | null;
  onSelectStudent: (student: Student) => void;
  onClose: () => void;
}

export const SelectTesterModal: React.FC<SelectTesterModalProps> = ({
  isOpen,
  students,
  currentStudentId,
  onSelectStudent,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-10 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                검사하는 학생(나) 선택
              </h2>
              <p className="text-xs text-slate-400">
                현재 검사를 진행하는 본인의 이름을 선택해주세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Student list */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {students.map((student) => {
              const isSelected = student.id === currentStudentId;
              const isBoy = student.gender === '남';

              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => {
                    onSelectStudent(student);
                    onClose();
                  }}
                  className={`
                    p-2.5 rounded-lg border text-left transition-all flex items-center justify-between
                    ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-100 font-semibold'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                        isBoy
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {student.gender}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-800">
                      {student.name}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="text-[10px] text-indigo-600 font-bold">선택됨</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </motion.div>
    </div>
  );
};
