import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { Sparkles, Check, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WishFriendsModalProps {
  isOpen: boolean;
  students: Student[];
  currentStudentId: string | null;
  initialSelectedIds?: string[];
  onSubmit: (selectedIds: string[]) => void;
  onSkip: () => void;
  onClose: () => void;
}

export const WishFriendsModal: React.FC<WishFriendsModalProps> = ({
  isOpen,
  students,
  currentStudentId,
  initialSelectedIds = [],
  onSubmit,
  onSkip,
  onClose,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync initial selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialSelectedIds);
      setSearchQuery('');
    }
  }, [isOpen, initialSelectedIds]);

  if (!isOpen) return null;

  // Filter out the testing student themselves
  const eligibleStudents = students.filter((s) => s.id !== currentStudentId);

  const filteredStudents = eligibleStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === eligibleStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleStudents.map((s) => s.id));
    }
  };

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

      {/* Modal Card matching screenshot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-10 max-h-[85vh] flex flex-col"
      >
        {/* Header Section matching screenshot */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1 text-indigo-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-semibold">마음거리 특별 항목</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                친해지고 싶은 친구들을 골라주세요
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                혹시.. 마음이 가지만 친해지지 못한 친구가 있나요?
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search & Summary */}
          {eligibleStudents.length > 8 && (
            <div className="mt-3.5 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="친구 이름 검색..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                />
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md shrink-0">
                {selectedIds.length}명 선택됨
              </span>
            </div>
          )}
        </div>

        {/* Friends Checkbox List */}
        <div className="p-3 overflow-y-auto flex-1 divide-y divide-slate-100">
          {filteredStudents.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              일치하는 친구가 없습니다.
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isChecked = selectedIds.includes(student.id);
              const isBoy = student.gender === '남';

              return (
                <div
                  key={student.id}
                  onClick={() => toggleStudent(student.id)}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-xs select-none
                    ${
                      isChecked
                        ? 'bg-indigo-50/50 hover:bg-indigo-50/80'
                        : 'hover:bg-slate-50'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* Custom Minimalist Checkbox */}
                    <div
                      className={`
                        w-4 h-4 rounded border flex items-center justify-center transition-colors
                        ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                            : 'border-slate-300 bg-white hover:border-slate-400'
                        }
                      `}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    {/* Student Name */}
                    <span
                      className={`text-sm ${
                        isChecked
                          ? 'font-bold text-indigo-950'
                          : 'font-normal text-slate-800'
                      }`}
                    >
                      {student.name}
                    </span>
                  </div>

                  {/* Gender pill indicator */}
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                      isBoy
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {student.gender}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions matching screenshot layout */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 px-1 hover:underline"
          >
            건너뛰기
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              닫기
            </button>

            <button
              type="button"
              onClick={() => onSubmit(selectedIds)}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
            >
              제출하기
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
