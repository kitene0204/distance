import React, { useState } from 'react';
import { Student, Gender } from '../types';
import { DEFAULT_STUDENTS } from '../data/defaultRoster';
import { Users, Plus, Trash2, RotateCcw, Check, Sparkles, AlertCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RosterManagerModalProps {
  isOpen: boolean;
  students: Student[];
  className: string;
  onSaveRoster: (newStudents: Student[], newClassName: string) => void;
  onClose: () => void;
}

export const RosterManagerModal: React.FC<RosterManagerModalProps> = ({
  isOpen,
  students,
  className,
  onSaveRoster,
  onClose
}) => {
  const [currentStudents, setCurrentStudents] = useState<Student[]>(students);
  const [currentClassName, setCurrentClassName] = useState<string>(className);
  const [activeTab, setActiveTab] = useState<'list' | 'bulk'>('list');
  const [bulkText, setBulkText] = useState('');
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<Gender>('남');
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Add individual student
  const handleAddStudent = () => {
    if (!newName.trim()) return;
    const nextNumber = currentStudents.length > 0
      ? Math.max(...currentStudents.map((s) => s.number || 0)) + 1
      : 1;

    const newStudent: Student = {
      id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      number: nextNumber,
      name: newName.trim(),
      gender: newGender
    };

    setCurrentStudents([...currentStudents, newStudent]);
    setNewName('');
    showToast(`'${newStudent.name}' 학생이 추가되었습니다.`);
  };

  // Delete student
  const handleDeleteStudent = (id: string) => {
    setCurrentStudents(currentStudents.filter((s) => s.id !== id));
  };

  // Toggle gender
  const handleToggleGender = (id: string) => {
    setCurrentStudents(
      currentStudents.map((s) =>
        s.id === id ? { ...s, gender: s.gender === '남' ? '여' : '남' } : s
      )
    );
  };

  // Update student name
  const handleUpdateName = (id: string, name: string) => {
    setCurrentStudents(
      currentStudents.map((s) => (s.id === id ? { ...s, name } : s))
    );
  };

  // Parse bulk text into students
  const handleParseBulkText = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split(/[\n,;]+/).map((l) => l.trim()).filter(Boolean);
    const parsed: Student[] = [];

    lines.forEach((line, idx) => {
      // Look for gender patterns: (남), (여), 남, 여, M, F
      let gender: Gender = idx % 2 === 0 ? '남' : '여'; // default alternation if not specified
      let cleanLine = line;

      if (line.includes('남') || line.toLowerCase().includes('m') || line.includes('boy')) {
        gender = '남';
      } else if (line.includes('여') || line.toLowerCase().includes('f') || line.includes('girl')) {
        gender = '여';
      }

      // Remove numbers, brackets, genders to extract pure name
      cleanLine = cleanLine
        .replace(/^\d+[\.\s\-\)]*/, '') // remove leading numbers like "1.", "1) ", "1 "
        .replace(/[\(\[\{]?(남|여|남자|여자|M|F)[\)\]\}]?/gi, '')
        .trim();

      if (cleanLine) {
        parsed.push({
          id: `std-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
          number: idx + 1,
          name: cleanLine,
          gender
        });
      }
    });

    if (parsed.length > 0) {
      setCurrentStudents(parsed);
      setActiveTab('list');
      setBulkText('');
      showToast(`${parsed.length}명의 학생 명부가 일괄 등록되었습니다.`);
    } else {
      alert('입력된 텍스트에서 학생 이름을 찾을 수 없습니다.');
    }
  };

  // Reset to default sample roster
  const handleResetToDefault = () => {
    if (window.confirm('예시 학생 명부(18명)로 초기화하시겠습니까?')) {
      setCurrentStudents(DEFAULT_STUDENTS);
      showToast('예시 명부로 초기화되었습니다.');
    }
  };

  // Save all changes
  const handleSave = () => {
    if (currentStudents.length === 0) {
      if (!window.confirm('명부에 학생이 0명입니다. 이대로 저장하시겠습니까?')) {
        return;
      }
    }
    onSaveRoster(currentStudents, currentClassName || '우리반');
    onClose();
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

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-10 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                우리반 명부 관리
              </h2>
              <p className="text-xs text-slate-400">
                검사에 사용할 우리반 학생 명단을 직접 등록하고 수정하세요.
              </p>
            </div>
          </div>

          {/* Class Name Input */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">학급명:</span>
            <input
              type="text"
              value={currentClassName}
              onChange={(e) => setCurrentClassName(e.target.value)}
              placeholder="예: 3학년 2반"
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 w-28 bg-white"
            />
          </div>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-2 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              학생 목록 ({currentStudents.length}명)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bulk')}
              className={`px-3.5 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'bulk'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              텍스트로 일괄 붙여넣기
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 hover:underline py-1"
          >
            <RotateCcw className="w-3 h-3" />
            예시 명단(18명) 불러오기
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
          {activeTab === 'list' ? (
            <div className="space-y-4">
              {/* Add New Student Form */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-600 ml-1">새 학생 추가:</span>
                <input
                  type="text"
                  placeholder="이름 입력 (예: 홍길동)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddStudent();
                    }
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 flex-1 min-w-[120px]"
                />

                {/* Gender selector */}
                <div className="inline-flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setNewGender('남')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      newGender === '남'
                        ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-indigo-600'
                    }`}
                  >
                    남
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewGender('여')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      newGender === '여'
                        ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-rose-600'
                    }`}
                  >
                    여
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddStudent}
                  disabled={!newName.trim()}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold rounded-lg text-xs flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  추가
                </button>
              </div>

              {/* Student Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {currentStudents.map((student, idx) => (
                  <div
                    key={student.id}
                    className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between gap-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-[11px] font-medium text-slate-400 w-5 text-right shrink-0">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={student.name}
                        onChange={(e) => handleUpdateName(student.id, e.target.value)}
                        className="text-xs font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-400 focus:outline-none px-1 py-0.5 w-full min-w-0"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Gender button toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleGender(student.id)}
                        className={`text-[10px] font-medium px-1.5 py-0.2 rounded transition-colors ${
                          student.gender === '남'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                        title="클릭하여 성별 전환 (남/여)"
                      >
                        {student.gender}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {currentStudents.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs">
                  등록된 학생이 없습니다. 위에서 학생을 추가하거나 [일괄 붙여넣기]를 이용하세요.
                </div>
              )}
            </div>
          ) : (
            /* Bulk Paste Tab */
            <div className="space-y-3">
              <div className="bg-slate-50 text-slate-700 p-3 rounded-lg text-xs flex items-start gap-2 border border-slate-200">
                <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">명렬표 텍스트 일괄 붙여넣기 안내</p>
                  <p className="mt-0.5 text-slate-500">
                    엑셀이나 나이스(NEIS)에서 복사한 학생 이름 또는 "1 김민수 남", "2 이영희 여" 형식의 텍스트를 붙여넣으세요.
                  </p>
                </div>
              </div>

              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`예시 형태:
1 박채현 남
2 황혜리 여
3 강윤찬 남
4 강주연 여
(또는 쉼표로 구분: 박채현(남), 황혜리(여), 강윤찬)`}
                rows={8}
                className="w-full p-3 text-xs text-slate-800 font-mono bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 resize-none leading-relaxed"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleParseBulkText}
                  disabled={!bulkText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  명단 파싱하여 적용하기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Toast notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-18 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-20"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between">
          <span className="text-xs text-slate-400">
            총 <strong className="text-slate-700">{currentStudents.length}</strong>명의 명부가 설정되었습니다.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
            >
              명부 저장 및 적용
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
