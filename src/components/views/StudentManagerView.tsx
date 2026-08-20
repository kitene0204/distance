import React, { useState } from 'react';
import { Student, Gender } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Download,
  FileSpreadsheet,
  Link,
  Sparkles,
  RefreshCw,
  Check,
} from 'lucide-react';
import { GoogleSheetsImportModal } from '../modals/GoogleSheetsImportModal';
import { motion, AnimatePresence } from 'motion/react';

interface StudentManagerViewProps {
  students: Student[];
  classNameStr: string;
  onSaveStudents: (newStudents: Student[]) => void;
  onStartSurveyForStudent: (student: Student) => void;
  onUpdateClassName?: (newClassName: string) => void;
  onResetToDefault?: () => void;
}

export const StudentManagerView: React.FC<StudentManagerViewProps> = ({
  students,
  classNameStr,
  onSaveStudents,
  onStartSurveyForStudent,
  onUpdateClassName,
  onResetToDefault,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<'all' | '남' | '여'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<Gender>('남');
  const [newNumber, setNewNumber] = useState<number>(students.length + 1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit student inline state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNumber, setEditNumber] = useState<number>(1);
  const [editGender, setEditGender] = useState<Gender>('남');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredStudents = students.filter((s) => {
    const matchName =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || String(s.number).includes(searchTerm);
    const matchGender = selectedGenderFilter === 'all' || s.gender === selectedGenderFilter;
    return matchName && matchGender;
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      number: newNumber,
      name: newName.trim(),
      gender: newGender,
      grade: 3,
      classNum: 1,
    };

    onSaveStudents([...students, newStudent]);
    setNewName('');
    setNewNumber(students.length + 2);
    setIsAddModalOpen(false);
    showToast(`'${newStudent.name}' 학생이 명렬표에 등록되었습니다.`);
  };

  const handleStartEdit = (student: Student) => {
    setEditingStudentId(student.id);
    setEditName(student.name);
    setEditNumber(student.number || 1);
    setEditGender(student.gender);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    const updated = students.map((s) =>
      s.id === id
        ? {
            ...s,
            name: editName.trim(),
            number: editNumber,
            gender: editGender,
          }
        : s
    );
    onSaveStudents(updated);
    setEditingStudentId(null);
    showToast(`학생 정보가 수정되었습니다.`);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`'${name}' 학생을 명단에서 삭제하시겠습니까?`)) {
      onSaveStudents(students.filter((s) => s.id !== id));
      showToast(`'${name}' 학생이 삭제되었습니다.`);
    }
  };

  // Google Sheets Import Callback
  const handleGoogleSheetsImportSuccess = (
    importedStudents: Student[],
    mode: 'replace' | 'append',
    detectedClass?: string
  ) => {
    if (mode === 'replace') {
      onSaveStudents(importedStudents);
      showToast(`구글 시트에서 ${importedStudents.length}명의 학생 명단을 새로 불러왔습니다.`);
    } else {
      const maxNum = students.length > 0 ? Math.max(...students.map((s) => s.number || 0)) : 0;
      const renumbered = importedStudents.map((st, i) => ({
        ...st,
        number: maxNum + i + 1,
      }));
      onSaveStudents([...students, ...renumbered]);
      showToast(`기존 명단에 ${importedStudents.length}명의 학생이 추가되었습니다.`);
    }

    if (detectedClass && detectedClass.trim() && onUpdateClassName) {
      onUpdateClassName(detectedClass.trim());
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>학생회원관리</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              총 {students.length}명
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>명렬표 보존됨 (수정 전까지 상시 유지)</span>
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {classNameStr} 학급 명렬표 관리 및 학생별 검사 참여 상태를 확인하고, 구글 시트 연동을 통해 원클릭 등록합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Google Sheets Import Button */}
          <button
            type="button"
            onClick={() => setIsGoogleSheetsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>구글 시트 연동 / 가져오기</span>
          </button>

          {/* Individual Add Student Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>개별 등록</span>
          </button>

          {/* Optional Reset to Sample Default */}
          {onResetToDefault && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('예시 명렬표(3학년 1반 24명)로 초기화하시겠습니까? 현재 등록된 명단이 예시 데이터로 교체됩니다.')) {
                  onResetToDefault();
                  showToast('예시 명렬표로 초기화되었습니다.');
                }
              }}
              className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="예시 명렬표로 되돌리기"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">예시 명렬표로 초기화</span>
            </button>
          )}
        </div>
      </div>

      {/* Google Sheets Guide Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>구글 스프레드시트 주소로 간편 등록하기</span>
              <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-md font-bold">
                추천
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              작성해두신 구글 시트 링크(URL)를 입력하거나 표를 복사(Ctrl+C)하여 붙여넣으면 [번호, 이름, 성별]이 자동 분석되어 즉시 학급 명단으로 설정됩니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsGoogleSheetsModalOpen(true)}
          className="px-4 py-2 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl shadow-2xs transition-colors whitespace-nowrap flex items-center gap-1.5 self-end md:self-center cursor-pointer"
        >
          <Link className="w-3.5 h-3.5 text-emerald-600" />
          <span>시트 주소 입력하기</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="이름 또는 번호 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Gender Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setSelectedGenderFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedGenderFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : ''
              }`}
            >
              전체 ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedGenderFilter('남')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedGenderFilter === '남' ? 'bg-white text-blue-600 shadow-2xs' : ''
              }`}
            >
              남학생 ({students.filter((s) => s.gender === '남').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedGenderFilter('여')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedGenderFilter === '여' ? 'bg-white text-pink-600 shadow-2xs' : ''
              }`}
            >
              여학생 ({students.filter((s) => s.gender === '여').length})
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-semibold self-end sm:self-center">
          표시 중: <strong className="text-slate-800">{filteredStudents.length}</strong> / {students.length}명
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-4 w-16 text-center">번호</th>
                <th className="py-3 px-4">이름</th>
                <th className="py-3 px-4 text-center">성별</th>
                <th className="py-3 px-4 text-center">학급</th>
                <th className="py-3 px-4 text-center">진단 상태</th>
                <th className="py-3 px-4 text-center">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.map((student) => {
                const isEditing = editingStudentId === student.id;

                if (isEditing) {
                  return (
                    <tr key={student.id} className="bg-blue-50/50">
                      <td className="py-2.5 px-4 text-center">
                        <input
                          type="number"
                          value={editNumber}
                          onChange={(e) => setEditNumber(Number(e.target.value))}
                          className="w-12 text-center py-1 border border-blue-300 rounded font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-32 py-1 px-2 border border-blue-300 rounded font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <select
                          value={editGender}
                          onChange={(e) => setEditGender(e.target.value as Gender)}
                          className="py-1 px-2 border border-blue-300 rounded font-bold text-xs"
                        >
                          <option value="남">남학생</option>
                          <option value="여">여학생</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-4 text-center text-slate-500">{classNameStr}</td>
                      <td className="py-2.5 px-4 text-center text-slate-400">-</td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(student.id)}
                            className="px-2.5 py-1 bg-blue-600 text-white rounded font-bold text-xs shadow-2xs hover:bg-blue-700"
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStudentId(null)}
                            className="px-2 py-1 bg-slate-200 text-slate-700 rounded font-bold text-xs hover:bg-slate-300"
                          >
                            취소
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-500">
                      {student.number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-2xs ${
                            student.gender === '남' ? 'bg-blue-500' : 'bg-pink-500'
                          }`}
                        >
                          {student.name.slice(0, 1)}
                        </div>
                        <span className="font-bold text-slate-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${
                          student.gender === '남'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-pink-50 text-pink-700 border border-pink-200'
                        }`}
                      >
                        {student.gender}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">{classNameStr}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-xs font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>완료</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onStartSurveyForStudent(student)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-xs border border-blue-200 transition-colors cursor-pointer"
                        >
                          검사 시작
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(student)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="학생 정보 수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(student.id, student.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="학생 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-4">신규 학생 등록</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">번호</label>
                <input
                  type="number"
                  value={newNumber}
                  onChange={(e) => setNewNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">이름</label>
                <input
                  type="text"
                  placeholder="예: 홍길동"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">성별</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm font-semibold">
                    <input
                      type="radio"
                      name="gender"
                      checked={newGender === '남'}
                      onChange={() => setNewGender('남')}
                      className="text-blue-600"
                    />
                    <span>남학생</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-sm font-semibold">
                    <input
                      type="radio"
                      name="gender"
                      checked={newGender === '여'}
                      onChange={() => setNewGender('여')}
                      className="text-pink-600"
                    />
                    <span>여학생</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Sheets Importer Modal */}
      <GoogleSheetsImportModal
        isOpen={isGoogleSheetsModalOpen}
        currentClassName={classNameStr}
        onImportSuccess={handleGoogleSheetsImportSuccess}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
      />
    </div>
  );
};

