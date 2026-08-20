import React, { useState } from 'react';
import { Student, Gender } from '../../types';
import {
  fetchGoogleSheetRoster,
  parseDelimitedText,
  parseStudentRosterFromRows,
  extractGoogleSheetId,
} from '../../utils/googleSheetsParser';
import {
  FileSpreadsheet,
  Link,
  ClipboardPaste,
  Upload,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Users,
  Sparkles,
  X,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GoogleSheetsImportModalProps {
  isOpen: boolean;
  currentClassName: string;
  onImportSuccess: (importedStudents: Student[], mode: 'replace' | 'append', className?: string) => void;
  onClose: () => void;
}

export const GoogleSheetsImportModal: React.FC<GoogleSheetsImportModalProps> = ({
  isOpen,
  currentClassName,
  onImportSuccess,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'paste' | 'file'>('url');
  const [sheetUrl, setSheetUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<Student[] | null>(null);
  const [detectedClassName, setDetectedClassName] = useState<string>(currentClassName);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [showShareGuide, setShowShareGuide] = useState(false);

  if (!isOpen) return null;

  // Handle Google Sheet URL Fetch
  const handleFetchUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sheetUrl.trim()) {
      setErrorMessage('구글 스프레드시트 URL을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await fetchGoogleSheetRoster(sheetUrl);
      setParsedResult(result.students);
      if (result.detectedClassName) {
        setDetectedClassName(result.detectedClassName);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || '구글 시트를 불러오지 못했습니다. 공유 설정을 확인하거나 [복사&붙여넣기] 탭을 이용해보세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Pasted Text Parsing (from Google Sheet Ctrl+C)
  const handleParsePastedText = () => {
    if (!pastedText.trim()) {
      setErrorMessage('구글 시트에서 복사한 내용을 입력창에 붙여넣어주세요.');
      return;
    }

    setErrorMessage(null);
    try {
      const rows = parseDelimitedText(pastedText);
      const result = parseStudentRosterFromRows(rows);
      if (result.students.length === 0) {
        setErrorMessage('학생 정보를 감지하지 못했습니다. 번호, 이름, 성별 열이 포함되어 있는지 확인해주세요.');
        return;
      }
      setParsedResult(result.students);
      if (result.detectedClassName) {
        setDetectedClassName(result.detectedClassName);
      }
    } catch (err: any) {
      setErrorMessage('텍스트를 분석하는 중 오류가 발생했습니다.');
    }
  };

  // Handle CSV File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        try {
          const rows = parseDelimitedText(text);
          const result = parseStudentRosterFromRows(rows);
          if (result.students.length === 0) {
            setErrorMessage('CSV 파일에서 학생 목록을 추출할 수 없습니다.');
            return;
          }
          setParsedResult(result.students);
          if (result.detectedClassName) {
            setDetectedClassName(result.detectedClassName);
          }
        } catch (err) {
          setErrorMessage('파일 읽기 오류가 발생했습니다.');
        }
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // Sample Google Sheets URL generator for testing
  const handleLoadSampleSheet = () => {
    // A sample pre-filled test text to let teachers try immediately
    const samplePaste = `번호\t이름\t성별\t학급
1\t강민준\t남\t3학년1반
2\t고은서\t여\t3학년1반
3\t김도현\t남\t3학년1반
4\t김서아\t여\t3학년1반
5\t박시우\t남\t3학년1반
6\t박지안\t여\t3학년1반
7\t송하윤\t여\t3학년1반
8\t안유준\t남\t3학년1반
9\t이지민\t여\t3학년1반
10\t이현우\t남\t3학년1반
11\t정다은\t여\t3학년1반
12\t조윤우\t남\t3학년1반`;

    setPastedText(samplePaste);
    setActiveTab('paste');
    const rows = parseDelimitedText(samplePaste);
    const result = parseStudentRosterFromRows(rows);
    setParsedResult(result.students);
  };

  // Apply Import
  const handleConfirmImport = () => {
    if (!parsedResult || parsedResult.length === 0) return;
    onImportSuccess(parsedResult, importMode, detectedClassName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                구글 스프레드시트 명렬표 가져오기
              </h2>
              <p className="text-xs text-slate-500">
                구글 시트에 정리된 [번호, 이름, 성별] 데이터를 자동으로 분석하여 학생 회원으로 등록합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Method Selection Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('url');
                setErrorMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'url'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Link className="w-4 h-4" />
              <span>구글 시트 URL 주소 입력</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('paste');
                setErrorMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'paste'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardPaste className="w-4 h-4" />
              <span>시트 복사 & 붙여넣기</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('file');
                setErrorMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'file'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>CSV 파일 업로드</span>
            </button>
          </div>

          {/* TAB 1: Google Sheet URL Input */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <form onSubmit={handleFetchUrl} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    구글 스프레드시트 공유 링크(URL)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>불러오는 중...</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          <span>명렬표 불러오기</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Helpful Sharing Guide Note */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold">구글 시트 연동 전 꼭 확인해주세요!</p>
                      <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                        구글 스프레드시트 우측 상단 <strong>[공유]</strong> 버튼 → 일반 액세스를{' '}
                        <strong className="underline">"링크가 있는 모든 사용자(뷰어)"</strong>로 설정해야 웹앱에서 안전하게 읽어올 수 있습니다.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadSampleSheet}
                    className="text-[11px] text-emerald-700 bg-white border border-emerald-300 px-2.5 py-1 rounded-lg font-bold hover:bg-emerald-100 transition-colors whitespace-nowrap"
                  >
                    💡 예시 양식 채우기
                  </button>
                </div>

                <div className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <strong className="text-slate-800">권장 시트 열 구성:</strong> A열: 번호 (1, 2, 3...) | B열: 이름 (홍길동) | C열: 성별 (남/여)
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Copy & Paste from Google Sheet */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    구글 시트 셀 복사(Ctrl+C) 후 여기에 붙여넣기(Ctrl+V)
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadSampleSheet}
                    className="text-[11px] text-blue-600 font-bold hover:underline"
                  >
                    예시 데이터 채우기
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={`구글 시트에서 [번호, 이름, 성별] 열을 드래그하여 복사한 뒤 붙여넣으세요.\n\n예시:\n1\t강민준\t남\n2\t고은서\t여\n3\t김도현\t남`}
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParsePastedText}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
                >
                  붙여넣은 내용 분석하기
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CSV File Upload */}
          {activeTab === 'file' && (
            <div className="space-y-3">
              <label className="block border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/30">
                <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">
                  컴퓨터의 명렬표 CSV 파일을 선택하거나 드래그하세요.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  .csv 또는 .tsv 파일 지원 (UTF-8 인코딩)
                </p>
                <input
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">{errorMessage}</p>
                <p className="text-[11px] text-rose-600">
                  구글 시트 접근이 원활하지 않은 경우, <strong>[시트 복사 & 붙여넣기]</strong> 탭에서 시트 셀을 직접 복사하여 붙여넣으시면 즉시 등록 가능합니다.
                </p>
              </div>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedResult && parsedResult.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-200 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <h3 className="font-bold text-sm text-slate-900">
                    인식된 학생 명단 미리보기 (총 <strong className="text-emerald-600">{parsedResult.length}명</strong>)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600">학급명:</label>
                  <input
                    type="text"
                    value={detectedClassName}
                    onChange={(e) => setDetectedClassName(e.target.value)}
                    className="px-2.5 py-1 text-xs font-bold border border-slate-300 rounded-lg w-28 text-slate-800"
                  />
                </div>
              </div>

              {/* Preview Table */}
              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0">
                    <tr>
                      <th className="py-2 px-3 text-center w-14">번호</th>
                      <th className="py-2 px-3">이름</th>
                      <th className="py-2 px-3 text-center w-20">성별</th>
                      <th className="py-2 px-3 text-center w-20">구분</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {parsedResult.map((st, idx) => (
                      <tr key={st.id || idx} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 text-center font-bold text-slate-500">
                          {st.number || idx + 1}
                        </td>
                        <td className="py-1.5 px-3 font-bold text-slate-900">{st.name}</td>
                        <td className="py-1.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              st.gender === '남'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-pink-50 text-pink-700 border border-pink-200'
                            }`}
                          >
                            {st.gender}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-center text-[11px] text-slate-400">
                          정상 인식
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Import Options (Replace or Append) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-4 font-semibold text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-emerald-600"
                    />
                    <span>기존 명렬표 새로 교체 (덮어쓰기)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-emerald-600"
                    />
                    <span>기존 명단 뒤에 추가</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-colors"
          >
            닫기
          </button>

          <button
            type="button"
            disabled={!parsedResult || parsedResult.length === 0}
            onClick={handleConfirmImport}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{parsedResult?.length || 0}명 학생 등록 완료</span>
          </button>
        </div>
      </div>
    </div>
  );
};
