import React, { useState } from 'react';
import { Student, StudentScoreStats, SurveySubmission } from '../../types';
import { Info, UserX } from 'lucide-react';

interface UniverseTabProps {
  students: Student[];
  statsList: StudentScoreStats[];
  submissions: SurveySubmission[];
  onSelectStudent: (student: Student) => void;
}

// Preset natural cluster coordinates for 19 students matching Image 2
const UNIVERSE_COORDS: Record<string, { x: number; y: number; group?: number }> = {
  'std-1': { x: 38, y: 72, group: 1 }, // 강윤찬 (Center Hub 1)
  'std-2': { x: 43, y: 47, group: 1 }, // 강주연
  'std-3': { x: 51, y: 86, group: 2 }, // 김민지
  'std-4': { x: 38, y: 61, group: 1 }, // 김진후 (Center Hub 2)
  'std-5': { x: 42, y: 77, group: 1 }, // 김현지
  'std-6': { x: 33, y: 76, group: 1 }, // 박채현
  'std-7': { x: 52, y: 72, group: 2 }, // 성서아
  'std-8': { x: 56, y: 82, group: 2 }, // 송다정
  'std-9': { x: 34, y: 55, group: 1 }, // 엄호준
  'std-10': { x: 52, y: 79, group: 2 }, // 윤시우
  'std-11': { x: 44, y: 41, group: 1 }, // 이솔빛나
  'std-12': { x: 41, y: 55, group: 1 }, // 이정
  'std-13': { x: 38, y: 51, group: 1 }, // 전성후
  'std-14': { x: 44, y: 92, group: 2 }, // 정혜원
  'std-15': { x: 48, y: 92, group: 2 }, // 최예은
  'std-16': { x: 61, y: 84, group: 2 }, // 한태은
  'std-17': { x: 65, y: 86, group: 2 }, // 허은서
  'std-18': { x: 90, y: 30, group: 0 }, // 황혜리 (Isolated)
  'std-19': { x: 90, y: 45, group: 0 }, // 전학생 (Isolated)
};

export const UniverseTab: React.FC<UniverseTabProps> = ({
  students,
  statsList,
  submissions,
  onSelectStudent,
}) => {
  const [showMesh, setShowMesh] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(42);
  const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(null);

  // Group isolated / unformed students (황혜리, 전학생 etc.)
  const isolatedStudents = students.filter((s) => {
    const coord = UNIVERSE_COORDS[s.id];
    const stat = statsList.find((st) => st.student.id === s.id);
    return coord?.group === 0 || (stat && stat.positiveCount === 0 && stat.wishCount === 0);
  });

  // Calculate links between students with mutual connection or close distance
  const links: { sourceId: string; targetId: string }[] = [];
  const processedPairs = new Set<string>();

  submissions.forEach((sub) => {
    (Object.entries(sub.placements) as [string, { category: 'close' | 'medium' | 'far'; reason?: string }][]).forEach(([targetId, place]) => {
      if (place.category === 'close') {
        const pairKey = [sub.studentId, targetId].sort().join('-');
        if (!processedPairs.has(pairKey)) {
          processedPairs.add(pairKey);
          links.push({ sourceId: sub.studentId, targetId });
        }
      }
    });
  });

  // Node size based on preference count
  const getNodeRadius = (studentId: string) => {
    const stat = statsList.find((s) => s.student.id === studentId);
    const pref = stat?.preferenceCount || 1;
    if (studentId === 'std-1' || studentId === 'std-4' || studentId === 'std-7') return 48; // Large hub
    if (pref >= 6) return 40;
    if (pref >= 4) return 34;
    return 28;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Center Graph Stage (9 cols) */}
      <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col min-h-[560px]">
        {/* Top Controls matching Image 2 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <span>발견된 그룹</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              학생을 클릭하여 자세한 정보를 확인하세요.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Mesh Toggle Switch matching screenshot */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={showMesh}
                onChange={(e) => setShowMesh(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  showMesh ? 'bg-sky-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                    showMesh ? 'left-4.5' : 'left-0.5'
                  }`}
                />
              </div>
              <span>그물망 보기</span>
            </label>

            {/* Zoom Controls matching screenshot */}
            <div className="flex items-center gap-1 text-xs border border-slate-200 rounded-md px-2 py-1 bg-slate-50">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(20, z - 5))}
                className="px-1 text-slate-600 hover:text-slate-900 font-bold"
              >
                -
              </button>
              <span className="px-2 font-semibold text-slate-700">{zoomLevel}</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(80, z + 5))}
                className="px-1 text-slate-600 hover:text-slate-900 font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* SVG & HTML Interactive Canvas */}
        <div className="relative flex-1 bg-slate-50/40 rounded-lg overflow-hidden border border-slate-100 min-h-[460px] flex items-center justify-center">
          <div
            style={{ transform: `scale(${zoomLevel / 42})` }}
            className="relative w-full h-[460px] transition-transform duration-200"
          >
            {/* SVG Connecting Mesh Lines */}
            {showMesh && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {links.map(({ sourceId, targetId }, i) => {
                  const sPos = UNIVERSE_COORDS[sourceId];
                  const tPos = UNIVERSE_COORDS[targetId];
                  if (!sPos || !tPos || sPos.group === 0 || tPos.group === 0) return null;

                  const isHighlighted =
                    hoveredStudentId === sourceId || hoveredStudentId === targetId;

                  return (
                    <line
                      key={i}
                      x1={`${sPos.x}%`}
                      y1={`${sPos.y}%`}
                      x2={`${tPos.x}%`}
                      y2={`${tPos.y}%`}
                      stroke={isHighlighted ? '#0284c7' : '#7dd3fc'}
                      strokeWidth={isHighlighted ? 2.5 : 1.5}
                      strokeDasharray="4 4"
                      className="transition-all"
                    />
                  );
                })}
              </svg>
            )}

            {/* Render Student Nodes matching Image 2 */}
            {students.map((student) => {
              const pos = UNIVERSE_COORDS[student.id];
              if (!pos || pos.group === 0) return null; // Isolated rendered on right panel or special area

              const radius = getNodeRadius(student.id);
              const isHovered = hoveredStudentId === student.id;

              return (
                <div
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  onMouseEnter={() => setHoveredStudentId(student.id)}
                  onMouseLeave={() => setHoveredStudentId(null)}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: `${radius * 2}px`,
                    height: `${radius * 2}px`,
                  }}
                  className={`
                    absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer
                    flex items-center justify-center text-center font-bold transition-all
                    shadow-sm select-none z-10
                    ${
                      isHovered
                        ? 'bg-sky-400 text-white scale-110 ring-4 ring-sky-200 z-30'
                        : 'bg-sky-200/90 hover:bg-sky-300 text-slate-900 border border-sky-300'
                    }
                  `}
                >
                  <span className={`${radius >= 44 ? 'text-xs font-extrabold' : 'text-[11px]'}`}>
                    {student.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Sidebar: 그룹 형성이 안 된 학생 matching Image 2 (3 cols) */}
      <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col">
        <h3 className="font-bold text-xs sm:text-sm text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
          <UserX className="w-4 h-4 text-amber-500" />
          <span>그룹 형성이 안 된 학생</span>
        </h3>

        <div className="space-y-3 flex-1">
          {isolatedStudents.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">모든 학생이 그룹에 연결되어 있습니다.</p>
          ) : (
            isolatedStudents.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectStudent(s)}
                className="p-3 rounded-lg bg-slate-50/80 border border-slate-200 hover:bg-amber-50 hover:border-amber-200 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span className="font-bold text-xs text-slate-900">{s.name}</span>
                <span className="text-[10px] text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded font-semibold">
                  집중 관찰 필요
                </span>
              </div>
            ))
          )}
        </div>

        <p className="text-[10px] text-slate-400 mt-4 leading-relaxed border-t border-slate-100 pt-3">
          * 상호 가까운 거리 지목이 없거나 관계망 외곽에 위치한 학생들을 선별하여 표시합니다.
        </p>
      </div>
    </div>
  );
};
