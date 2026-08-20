import { SurveySubmission, Student, TrafficLightStatus, AttentionStudentCardData, SelfDiagnosisScores } from '../types';
import { DEFAULT_STUDENTS } from './defaultRoster';

// Diagnostic Round Definitions
export interface DiagnosticRoundMeta {
  round: number;
  label: string;
  subLabel: string;
  date: string;
}

export const DIAGNOSTIC_ROUNDS: DiagnosticRoundMeta[] = [
  { round: 1, label: '1학기진단', subLabel: '1학기진단(2021-03-15)', date: '2021-03-15' },
  { round: 2, label: '2학기진단', subLabel: '2학기진단(2021-06-20)', date: '2021-06-20' },
  { round: 3, label: '3학기진단', subLabel: '3학기진단(2021-09-25)', date: '2021-09-25' },
  { round: 4, label: '4학기진단', subLabel: '4학기진단(2022-01-10)', date: '2022-01-10' },
];

// Traffic Light statuses exactly matching Screenshot 1 (우리반 관계 신호등)
// 🔵 = 이전대비관심군지수(-2점이상, 개선/안정)
// ⚪ = 이전대비관심군지수(-1~+1점, 유지)
// 🔴 = 이전대비관심군지수(+2점이상, 관심군/위험도 증가)
export const STUDENT_TRAFFIC_LIGHTS: Record<number, TrafficLightStatus> = {
  1: 'improved', // 1. 성미희 [🔵]
  2: 'improved', // 2. 류지민 [🔵]
  3: 'improved', // 3. 서경하 [🔵]
  4: 'stable',   // 4. 홍재식 [⚪]
  5: 'stable',   // 5. 박태수 [⚪]
  6: 'alert',    // 6. 이수혁 [🔴]
  7: 'improved', // 7. 서효은 [🔵]
  8: 'improved', // 8. 정준현 [🔵]
  9: 'improved', // 9. 윤선아 [🔵]
  10: 'stable',  // 10. 손설현 [⚪]
  11: 'alert',   // 11. 고종혁 [🔴]
  12: 'improved',// 12. 배세진 [🔵]
  13: 'stable',  // 13. 강원숙 [⚪]
  14: 'stable',  // 14. 강준호 [⚪]
  15: 'alert',   // 15. 문종호 [🔴]
  16: 'alert',   // 16. 표영혜 [🔴]
  17: 'improved',// 17. 김석희 [🔵]
  18: 'alert',   // 18. 송재진 [🔴]
  19: 'stable',  // 19. 오민지 [⚪]
  20: 'stable',  // 20. 안지훈 [⚪]
  21: 'stable',  // 21. 윤재민 [⚪]
  22: 'alert',   // 22. 홍혜진 [🔴]
  23: 'stable',  // 23. 서기준 [⚪]
  24: 'alert',   // 24. 황기원 [🔴]
};

// Attention Students Delta exactly matching Screenshot 1
export const ATTENTION_STUDENT_PRESETS: AttentionStudentCardData[] = [
  {
    student: DEFAULT_STUDENTS[7] || { id: 'std-8', number: 8, name: '정준현', gender: '남' },
    statusType: '개선',
    positiveOutgoingDelta: 6,   // 긍정마당발 ↑ 6
    negativeOutgoingDelta: -10, // 부정마당발 ↓ 10
    attentionRiskDelta: -3,     // 관심군 ↓ 3
    isolatedDelta: -1,          // 홀로형 ↓ 1
    signalStatus: 'improved',
  },
  {
    student: DEFAULT_STUDENTS[6] || { id: 'std-7', number: 7, name: '서효은', gender: '여' },
    statusType: '개선',
    positiveOutgoingDelta: 0,   // 긍정마당발 - 0
    negativeOutgoingDelta: -3,  // 부정마당발 ↓ 3
    attentionRiskDelta: -3,     // 관심군 ↓ 3
    isolatedDelta: -5,          // 홀로형 ↓ 5
    signalStatus: 'improved',
  },
  {
    student: DEFAULT_STUDENTS[3] || { id: 'std-4', number: 4, name: '홍재식', gender: '남' },
    statusType: '유지',
    positiveOutgoingDelta: -1,  // 긍정마당발 ↓ 1
    negativeOutgoingDelta: 3,   // 부정마당발 ↑ 3
    attentionRiskDelta: -1,     // 관심군 ↓ 1
    isolatedDelta: -1,          // 홀로형 ↓ 1
    signalStatus: 'stable',
  },
  {
    student: DEFAULT_STUDENTS[4] || { id: 'std-5', number: 5, name: '박태수', gender: '남' },
    statusType: '관심',
    positiveOutgoingDelta: -4,  // 긍정마당발 ↓ 4
    negativeOutgoingDelta: 0,   // 부정마당발 - 0
    attentionRiskDelta: 0,      // 관심군 - 0
    isolatedDelta: 1,           // 홀로형 ↑ 1
    signalStatus: 'stable',
  },
  {
    student: DEFAULT_STUDENTS[18] || { id: 'std-19', number: 19, name: '오민지', gender: '여' },
    statusType: '개선',
    positiveOutgoingDelta: 0,   // 긍정마당발 - 0
    negativeOutgoingDelta: 0,   // 부정마당발 - 0
    attentionRiskDelta: 1,      // 관심군 ↑ 1
    isolatedDelta: -4,          // 홀로형 ↓ 4
    signalStatus: 'improved',
  },
];

// Multi-round Trend Line Chart Data for Screenshot 1
export interface MultiRoundTrendPoint {
  roundKey: string;
  roundLabel: string;
  positive: number; // 긍정지목
  negative: number; // 부정지목
  arrowConcentration: number; // 화살표 집중도
}

export const MULTI_ROUND_TREND_DATA: MultiRoundTrendPoint[] = [
  { roundKey: '1학기진단', roundLabel: '1학기진단', positive: 5.2, negative: 4.8, arrowConcentration: 7.2 },
  { roundKey: '2학기진단', roundLabel: '2학기진단', positive: 7.8, negative: 4.1, arrowConcentration: 9.5 },
  { roundKey: '3학기진단', roundLabel: '3학기진단', positive: 10.4, negative: 7.6, arrowConcentration: 11.2 },
  { roundKey: '4학기진단', roundLabel: '4학기진단', positive: 13.8, negative: 11.4, arrowConcentration: 13.5 },
];

// 6-axis Self-diagnosis Radar Data exactly matching Screenshot 2
export const CLASS_SELF_DIAGNOSIS_SCORES: SelfDiagnosisScores = {
  openness: 1.8,      // 개방성
  satisfaction: 2.0,  // 만족감
  trust: 1.7,         // 신뢰감
  communication: 1.8, // 의사소통
  understanding: 2.4, // 이해성
  intimacy: 2.0,      // 친근감
};

export const RADAR_CHART_DIMENSIONS = [
  { dimension: '개방성', fullMark: 3.0, value: 1.8, desc: '자신의 내면을 친구에서 솔직하게 드러낼 수 있는 정도' },
  { dimension: '만족감', fullMark: 3.0, value: 2.0, desc: '친구와의 관계에서 흡족한 느낌의 정도' },
  { dimension: '신뢰감', fullMark: 3.0, value: 1.7, desc: '교우관계 속에서의 믿음의 정도' },
  { dimension: '의사소통', fullMark: 3.0, value: 1.8, desc: '친구와 서로의 생각이나 느낌을 전하고 받는 정도' },
  { dimension: '이해성', fullMark: 3.0, value: 2.4, desc: '이성적으로 사리분별하여 해석 및 포용할 수 있는 정도' },
  { dimension: '친근감', fullMark: 3.0, value: 2.0, desc: '친구에 대하여 느끼는 거리감이나 친근함의 정도' },
];

// Curated relations for Sociogram & Matrix
export function generateDefaultSubmissions(students: Student[] = DEFAULT_STUDENTS): SurveySubmission[] {
  const result: SurveySubmission[] = [];
  const now = Date.now();

  // Create submissions for rounds 1, 2, 3, 4
  [1, 2, 3, 4].forEach((roundNum) => {
    students.forEach((student, idx) => {
      const sNum = student.number || (idx + 1);
      const placements: Record<string, { category: 'close' | 'medium' | 'far'; reason?: string }> = {};
      const wishFriendIds: string[] = [];

      students.forEach((target, tIdx) => {
        if (target.id === student.id) return;
        const tNum = target.number || (tIdx + 1);
        const diff = Math.abs(sNum - tNum);

        // Deterministic but realistic relationship generation
        if (diff === 1 || diff === 2 || (sNum * 3 + tNum) % 7 === 0) {
          // Positive close tie
          placements[target.id] = {
            category: 'close',
            reason: roundNum >= 3 ? '평소에 대화가 잘 통하고 배려심이 많음' : '같이 놀았을 때 편함'
          };
          if ((sNum + tNum) % 5 === 0) {
            wishFriendIds.push(target.id);
          }
        } else if ((sNum + tNum * 2) % 9 === 0 && (tNum === 6 || tNum === 15 || tNum === 24)) {
          // Negative tie (targeted to alert students like 6, 15, 24)
          placements[target.id] = {
            category: 'far',
            reason: '가끔 짓궂은 장난을 치거나 말이 험함'
          };
        } else {
          // Neutral medium tie
          placements[target.id] = {
            category: 'medium',
            reason: ''
          };
        }
      });

      result.push({
        id: `sub-r${roundNum}-${student.id}`,
        round: roundNum,
        studentId: student.id,
        studentName: student.name,
        studentGender: student.gender,
        className: '3학년1반',
        timestamp: now - (4 - roundNum) * 1000 * 60 * 60 * 24 * 30,
        placements,
        wishFriendIds
      });
    });
  });

  return result;
}
