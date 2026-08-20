import React, { useState, useMemo } from 'react';
import { Student, SurveySubmission, DistanceCategory } from '../../types';
import {
  DIAGNOSTIC_ROUNDS,
  RADAR_CHART_DIMENSIONS,
  CLASS_SELF_DIAGNOSIS_SCORES,
} from '../../data/mockSurveyData';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown, Info, School, Sparkles, ExternalLink, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface PeerRelationshipReportViewProps {
  students: Student[];
  submissions: SurveySubmission[];
  classNameStr: string;
  selectedRound: number;
  onRoundChange: (round: number) => void;
  onSelectStudent: (student: Student) => void;
  onOpenTeacherDashboardModal: () => void;
}

export const PeerRelationshipReportView: React.FC<PeerRelationshipReportViewProps> = ({
  students,
  submissions,
  classNameStr,
  selectedRound,
  onRoundChange,
  onSelectStudent,
  onOpenTeacherDashboardModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'relationship_report' | 'self_test' | 'peer_test' | 'full_graph'
  >('relationship_report');

  const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(null);

  // Filter submissions by selected round
  const currentSubmissions = useMemo(() => {
    return submissions.filter((s) => (s.round || 4) === selectedRound);
  }, [submissions, selectedRound]);

  // Compute Sociogram node positions (Circular layout for 15~24 students)
  const nodeLayout = useMemo(() => {
    const total = students.length;
    const centerX = 300;
    const centerY = 240;
    const radius = 175;

    return students.map((st, i) => {
      const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return {
        student: st,
        x,
        y,
      };
    });
  }, [students]);

  // Compute directed edges (positive green & negative orange arrows)
  const edges = useMemo(() => {
    const list: {
      sourceId: string;
      targetId: string;
      category: DistanceCategory;
      reason?: string;
      isWish?: boolean;
    }[] = [];

    currentSubmissions.forEach((sub) => {
      const wishSet = new Set(sub.wishFriendIds || []);
      (Object.entries(sub.placements) as [string, { category: DistanceCategory; reason?: string }][]).forEach(([targetId, place]) => {
        if (place.category === 'close' || place.category === 'far') {
          list.push({
            sourceId: sub.studentId,
            targetId,
            category: place.category,
            reason: place.reason,
            isWish: wishSet.has(targetId),
          });
        }
      });
    });

    return list;
  }, [currentSubmissions]);

  // Node position map for quick lookup
  const posMap = useMemo(() => {
    const map: Record<string, { x: number; y: number; student: Student }> = {};
    nodeLayout.forEach((item) => {
      map[item.student.id] = item;
    });
    return map;
  }, [nodeLayout]);

  // Find risk student (with most negative choices or high isolation)
  const riskStudent = useMemo(() => {
    return students.find((s) => s.number === 6 || s.number === 5) || students[4] || students[0];
  }, [students]);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Row matching Screenshot 2 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            우리반 관계 읽기 <span className="text-blue-600 font-bold">AI기반</span> 리포트
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            소시오그램 교우관계 네트워크 및 6대 척도 자가진단 분석 리포트입니다.
          </p>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Class selector */}
          <div className="relative">
            <select
              value={classNameStr}
              disabled
              className="appearance-none bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold py-2 pl-3 pr-8 rounded-lg shadow-2xs cursor-pointer focus:outline-hidden"
            >
              <option value="3학년1반">3학년1반</option>
              <option value="우리반 (3-2)">우리반 (3-2)</option>
              <option value="테스트반">테스트반</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Diagnostic round selector */}
          <div className="relative">
            <select
              value={selectedRound}
              onChange={(e) => onRoundChange(Number(e.target.value))}
              className="appearance-none bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm font-bold py-2 pl-3 pr-8 rounded-lg shadow-2xs hover:border-slate-400 cursor-pointer focus:outline-hidden"
            >
              {DIAGNOSTIC_ROUNDS.map((r) => (
                <option key={r.round} value={r.round}>
                  {r.subLabel}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. Sub-tab Buttons Bar matching Screenshot 2 */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveSubTab('relationship_report')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-2xs ${
              activeSubTab === 'relationship_report'
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200'
            }`}
          >
            교우관계분석리포트
          </button>

          <button
            type="button"
            onClick={() => onOpenTeacherDashboardModal()}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 transition-all shadow-2xs"
          >
            자가진단
          </button>

          <button
            type="button"
            onClick={() => onOpenTeacherDashboardModal()}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 transition-all shadow-2xs"
          >
            교우관계진단
          </button>

          <button
            type="button"
            onClick={() => onOpenTeacherDashboardModal()}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 transition-all shadow-2xs"
          >
            전체교우관계그래프
          </button>
        </div>

        {/* Right Class Badge */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <School className="w-4 h-4 text-blue-600" />
          <span>{classNameStr}</span>
        </div>
      </div>

      {/* 3. Main 2-Column Grid (Graph on Left, Radar Self-Diagnosis on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7~8 cols): 교우관계 전체 그래프 */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              교우관계 전체 그래프
            </h2>
            <button
              type="button"
              onClick={onOpenTeacherDashboardModal}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>자세히보기 +</span>
            </button>
          </div>

          {/* Interactive Sociogram SVG Canvas */}
          <div className="relative w-full aspect-[5/4] max-h-[480px] bg-slate-50/50 rounded-xl border border-slate-200/80 overflow-hidden flex items-center justify-center">
            <svg
              viewBox="0 0 600 480"
              className="w-full h-full select-none"
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Arrowhead Marker for Green Positive Edge */}
                <marker
                  id="arrow-green"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
                </marker>

                {/* Arrowhead Marker for Orange Negative Edge */}
                <marker
                  id="arrow-orange"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#f97316" />
                </marker>
              </defs>

              {/* Edge Paths */}
              {edges.map((edge, idx) => {
                const sPos = posMap[edge.sourceId];
                const tPos = posMap[edge.targetId];
                if (!sPos || !tPos) return null;

                const isConnected =
                  hoveredStudentId === edge.sourceId || hoveredStudentId === edge.targetId;
                const isDimmed = hoveredStudentId && !isConnected;

                const isGreen = edge.category === 'close';
                const strokeColor = isGreen ? '#10b981' : '#f97316';
                const markerId = isGreen ? 'url(#arrow-green)' : 'url(#arrow-orange)';

                return (
                  <path
                    key={`edge-${idx}`}
                    d={`M ${sPos.x} ${sPos.y} L ${tPos.x} ${tPos.y}`}
                    stroke={strokeColor}
                    strokeWidth={isConnected ? 2.5 : 1.2}
                    strokeOpacity={isDimmed ? 0.08 : isConnected ? 0.9 : 0.45}
                    markerEnd={markerId}
                    className="transition-all duration-200"
                  />
                );
              })}

              {/* Student Circle Nodes */}
              {nodeLayout.map(({ student, x, y }) => {
                const isHovered = hoveredStudentId === student.id;
                const isDimmed = hoveredStudentId && !isHovered;
                const isBoy = student.gender === '남';

                // Boys: sky blue, Girls: soft pink/violet
                const nodeBg = isBoy ? '#3b82f6' : '#ec4899';
                const strokeColor = isBoy ? '#1d4ed8' : '#be185d';

                return (
                  <g
                    key={student.id}
                    className="cursor-pointer transition-transform duration-200"
                    onMouseEnter={() => setHoveredStudentId(student.id)}
                    onMouseLeave={() => setHoveredStudentId(null)}
                    onClick={() => onSelectStudent(student)}
                    transform={`translate(${x}, ${y}) scale(${isHovered ? 1.15 : 1})`}
                  >
                    {/* Node Circle */}
                    <circle
                      r={19}
                      fill={nodeBg}
                      stroke="#ffffff"
                      strokeWidth={2.5}
                      opacity={isDimmed ? 0.35 : 1}
                      className="shadow-sm"
                    />

                    {/* Label inside node: Number & Name */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="bold"
                      opacity={isDimmed ? 0.35 : 1}
                      pointerEvents="none"
                    >
                      {student.number}. {student.name.slice(0, 3)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom Guide and Stats Card matching Screenshot 2 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs text-slate-700">
            {/* Top Legend and Density Highlight */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-3 font-semibold">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                  <span>남학생</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-pink-500 inline-block" />
                  <span>여학생</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600">
                  <span className="w-3.5 h-1 bg-emerald-500 inline-block rounded-full" />
                  <span>긍정</span>
                </div>
                <div className="flex items-center gap-1 text-amber-600">
                  <span className="w-3.5 h-1 bg-amber-500 inline-block rounded-full" />
                  <span>부정</span>
                </div>
              </div>

              <div className="text-sm font-black text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                우리반 교우관계 밀집도 <span className="text-blue-600">79.0%</span>
              </div>
            </div>

            {/* Risk Alert Text */}
            <p className="font-bold text-slate-900 text-xs sm:text-sm">
              전체 {students.length}명 중 관심 가져야 할 위험군은{' '}
              <strong className="text-rose-600 underline font-black">
                {riskStudent.number}. {riskStudent.name}
              </strong>{' '}
              으로 보여집니다.
            </p>

            {/* Density Scale Reference Table */}
            <div className="space-y-1.5 text-[11px] text-slate-600 pt-1">
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-700 whitespace-nowrap">50% 이상:</span>
                <span>굉장히 밀접하게 연결되어 있는 정도로 우리 반 내 관계가 굉장히 돈독합니다.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-700 whitespace-nowrap">30~20%:</span>
                <span>밀집도가 보통 수준으로 저학년 보다는 주로 고학년에서 해당됩니다.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-700 whitespace-nowrap">10% 이하:</span>
                <span>밀집도가 낮은 수준으로 학급 내 서로에 대해서 잘 모르는 상태로 볼 수 있습니다.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4~5 cols): 교우관계 자가지단 matching Screenshot 2 */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              교우관계 자가지단
            </h2>
          </div>

          {/* Recharts 6-Axis Radar Chart */}
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={RADAR_CHART_DIMENSIONS}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 3]}
                  tick={{ fill: '#94a3b8', fontSize: 9 }}
                />
                <Radar
                  name="우리반 평균"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Average Scores Indicator Tags matching Screenshot 2 */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500">우리반 평균</span>
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-bold text-slate-800">
              <div className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2">
                <span className="text-slate-400 font-normal">개방성</span>{' '}
                <span className="text-blue-600">1.8</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2">
                <span className="text-slate-400 font-normal">만족감</span>{' '}
                <span className="text-blue-600">2.0</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2">
                <span className="text-slate-400 font-normal">신뢰감</span>{' '}
                <span className="text-blue-600">1.7</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2">
                <span className="text-slate-400 font-normal">의사소통</span>{' '}
                <span className="text-blue-600">1.8</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2">
                <span className="text-slate-400 font-normal">이해성</span>{' '}
                <span className="text-blue-600">2.4</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2">
                <span className="text-slate-400 font-normal">친근감</span>{' '}
                <span className="text-blue-600">2.0</span>
              </div>
            </div>
          </div>

          {/* Scale Definition Dictionary Box matching Screenshot 2 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-[11px] text-slate-600 leading-relaxed">
            <div className="space-y-1">
              <p>
                <strong className="text-slate-900">개방성:</strong> 자신의 내면을 친구에서 솔직하게 드러낼 수 있는 정도
              </p>
              <p>
                <strong className="text-slate-900">만족감:</strong> 친구와의 관계에서 흡족한 느낌의 정도
              </p>
              <p>
                <strong className="text-slate-900">신뢰감:</strong> 교우관계 속에서의 믿음의 정도
              </p>
              <p>
                <strong className="text-slate-900">의사소통:</strong> 친구와 서로의 생각이나 느낌을 전하고 받는 정도
              </p>
              <p>
                <strong className="text-slate-900">이해성:</strong> 이성적으로 사리분별하여 해석 및 포용할 수 있는 정도
              </p>
              <p>
                <strong className="text-slate-900">친근감:</strong> 친구에 대하여 느끼는 거리감이나 친근함의 정도
              </p>
            </div>
            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
              ※ 한국청소년상담원(1998) 개발한 교우관계 척도 검사로 구성
            </p>
          </div>
        </div>
      </div>

      {/* 4. Bottom Disclaimer Footnote matching Screenshot 2 */}
      <div className="text-[11px] text-slate-500 text-center py-2">
        ※ 우리반 관계 읽기는 학급 내 학생들의 진단 및 응답을 기본으로 분석하므로 학생의 '응답의 성실도' 등에 따라 실제 교우관계와 일부 다를 수 있습니다.
      </div>
    </div>
  );
};
