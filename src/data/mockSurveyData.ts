import { SurveySubmission, Student } from '../types';
import { DEFAULT_STUDENTS } from './defaultRoster';

// Exact Matrix definition from User Screenshot 3 (2회차)
// 1: close (가까운), 2: medium (중간), 3: far (불편), 4: wish (친해지고 싶은)
const MATRIX_ROUND_2: Record<number, Record<number, { cat?: 'close' | 'medium' | 'far'; wish?: boolean; reason?: string }>> = {
  1: { // 1번 강윤찬
    2: { cat: 'medium' },
    3: { cat: 'medium' },
    4: { cat: 'close', reason: '친하고 수업 참여를 잘해서' },
    5: { cat: 'close', reason: '사귀고 있고 수업 참여도 잘해서' },
    6: { cat: 'close', reason: '많이 놀았고 수업 참여도 잘 해서' },
    7: { cat: 'medium' },
    8: { cat: 'medium' },
    9: { cat: 'medium' },
    10: { cat: 'medium' },
    11: { cat: 'far', reason: '자주 다투어서 서먹함' },
    12: { cat: 'medium' },
    13: { cat: 'far', reason: '장난이 너무 심해서 부담스러움' },
    14: { cat: 'medium' },
    15: { cat: 'medium' },
    16: { cat: 'medium' },
    17: { cat: 'medium' },
    18: { cat: 'far' },
  },
  2: { // 2번 강주연
    1: { cat: 'medium' },
    3: { cat: 'medium' },
    4: { cat: 'far' },
    5: { cat: 'close' },
    6: { cat: 'far' },
    7: { cat: 'medium' },
    8: { cat: 'medium' },
    9: { cat: 'medium' },
    10: { cat: 'medium' },
    11: { cat: 'close' },
    12: { cat: 'close' },
    13: { cat: 'far' },
    14: { cat: 'medium' },
    15: { cat: 'medium' },
    16: { cat: 'medium' },
    17: { cat: 'close' },
    18: { cat: 'close' },
  },
  3: { // 3번 김민지
    1: { cat: 'medium' },
    2: { cat: 'medium' },
    4: { cat: 'medium' },
    5: { cat: 'close' },
    6: { cat: 'medium', wish: true },
    7: { cat: 'close' },
    8: { cat: 'far' },
    9: { cat: 'medium' },
    10: { cat: 'close' },
    11: { cat: 'medium' },
    12: { cat: 'medium' },
    13: { cat: 'far' },
    14: { cat: 'medium' },
    15: { cat: 'close' },
    16: { cat: 'medium', wish: true },
    17: { cat: 'medium' },
    18: { cat: 'medium' },
  },
  4: { // 4번 김진후
    1: { cat: 'close', reason: '성격이 밝고 게임 같이 함' },
    2: { cat: 'medium' },
    3: { cat: 'medium' },
    5: { cat: 'medium' },
    6: { cat: 'close', reason: '축구 같이 매일 함' },
    7: { cat: 'medium' },
    8: { cat: 'close' },
    9: { cat: 'close' },
    10: { cat: 'medium' },
    11: { cat: 'medium' },
    12: { cat: 'close' },
    13: { cat: 'close' },
    14: { cat: 'medium' },
    15: { cat: 'medium' },
    16: { cat: 'close' },
    17: { cat: 'medium' },
    18: { cat: 'medium' },
  },
  5: { // 5번 김현지
    1: { cat: 'close', reason: '친절하고 다정함' },
    2: { cat: 'medium' },
    3: { cat: 'close' },
    4: { cat: 'close' },
    6: { cat: 'close' },
    7: { cat: 'close' },
    8: { cat: 'medium' },
    9: { cat: 'close' },
    10: { cat: 'close' },
    11: { cat: 'medium' },
    12: { cat: 'medium' },
    13: { cat: 'medium' },
    14: { cat: 'close' },
    15: { cat: 'close' },
    16: { cat: 'medium' },
    17: { cat: 'medium' },
    18: { cat: 'medium' },
  },
  6: { // 6번 박채현
    1: { cat: 'close', reason: '짝꿍이었을 때 잘 맞음' },
    2: { cat: 'medium' },
    3: { cat: 'medium' },
    4: { cat: 'close' },
    5: { cat: 'medium' },
    7: { cat: 'medium' },
    8: { cat: 'medium' },
    9: { cat: 'close' },
    10: { cat: 'medium' },
    11: { cat: 'medium' },
    12: { cat: 'close' },
    13: { cat: 'close' },
    14: { cat: 'medium' },
    15: { cat: 'medium' },
    16: { cat: 'medium' },
    17: { cat: 'medium' },
    18: { cat: 'medium' },
  },
  7: { // 7번 성서아
    1: { cat: 'medium' },
    2: { cat: 'medium' },
    3: { cat: 'close' },
    4: { cat: 'medium' },
    5: { cat: 'close' },
    6: { cat: 'medium' },
    8: { cat: 'medium' },
    9: { cat: 'medium' },
    10: { cat: 'close' },
    11: { cat: 'medium' },
    12: { cat: 'medium' },
    13: { cat: 'medium' },
    14: { cat: 'far' },
    15: { cat: 'close' },
    16: { cat: 'medium' },
    17: { cat: 'medium' },
    18: { cat: 'medium' },
  },
  8: { // 8번 송다정
    1: { cat: 'medium' },
    2: { cat: 'medium' },
    3: { cat: 'medium' },
    4: { cat: 'medium' },
    5: { cat: 'medium' },
    6: { cat: 'medium' },
    7: { cat: 'close' },
    9: { cat: 'medium' },
    10: { cat: 'close' },
    11: { cat: 'medium' },
    12: { cat: 'medium' },
    13: { cat: 'far' },
    14: { cat: 'medium' },
    15: { cat: 'medium' },
    16: { cat: 'close' },
    17: { cat: 'close' },
    18: { cat: 'medium' },
  },
  9: { // 9번 엄호준
    1: { cat: 'close' },
    2: { cat: 'medium' },
    3: { cat: 'medium' },
    4: { cat: 'close' },
    5: { cat: 'medium' },
    6: { cat: 'close' },
    7: { cat: 'medium' },
    8: { cat: 'medium' },
    10: { cat: 'medium' },
    11: { cat: 'medium' },
    12: { cat: 'close' },
    13: { cat: 'close' },
    14: { cat: 'medium' },
    15: { cat: 'medium' },
    16: { cat: 'medium' },
    17: { cat: 'medium' },
    18: { cat: 'medium' },
  },
  10: { // 10번 윤시우
    2: { cat: 'medium' },
    3: { cat: 'close' },
    5: { cat: 'close' },
    7: { cat: 'close' },
    8: { cat: 'close' },
    11: { cat: 'medium' },
    14: { cat: 'medium' },
    15: { cat: 'close' },
    16: { cat: 'medium' },
    17: { cat: 'medium' },
    18: { cat: 'medium' },
  },
  11: { // 11번 이솔빛나
    1: { cat: 'medium' },
    2: { cat: 'close' },
    3: { cat: 'medium' },
    4: { cat: 'medium' },
    5: { cat: 'close' },
    6: { cat: 'medium' },
    7: { cat: 'close' },
    8: { cat: 'far' },
    9: { cat: 'close' },
    10: { cat: 'close' },
    12: { cat: 'medium' },
    13: { cat: 'medium' },
    14: { cat: 'medium', wish: true },
    15: { cat: 'medium', wish: true },
    16: { cat: 'medium' },
    17: { cat: 'medium' },
    18: { cat: 'close' },
  },
  12: { // 12번 이정
    1: { cat: 'close' },
    2: { cat: 'close' },
    3: { cat: 'medium' },
    4: { cat: 'close' },
    5: { cat: 'medium' },
    6: { cat: 'close' },
    7: { cat: 'medium', wish: true },
    8: { cat: 'close' },
    9: { cat: 'close' },
    10: { cat: 'medium', wish: true },
    11: { cat: 'medium' },
    13: { cat: 'close' },
    14: { cat: 'medium' },
    15: { cat: 'medium' },
    16: { cat: 'medium' },
    17: { cat: 'medium' },
    18: { cat: 'close' },
  },
  13: { // 13번 전성후
    1: { cat: 'close' },
    2: { cat: 'far' },
    3: { cat: 'medium' },
    4: { cat: 'close' },
    5: { cat: 'far' },
    6: { cat: 'close' },
    7: { cat: 'medium' },
    8: { cat: 'medium' },
    9: { cat: 'close' },
    10: { cat: 'far' },
    11: { cat: 'medium' },
    12: { cat: 'medium' },
    14: { cat: 'medium' },
    15: { cat: 'medium' },
    16: { cat: 'medium' },
    17: { cat: 'medium' },
    18: { cat: 'medium' },
  },
  14: { // 14번 정혜원
    1: { cat: 'medium' },
    2: { cat: 'medium' },
    3: { cat: 'close' },
    4: { cat: 'medium' },
    5: { cat: 'close' },
    6: { cat: 'medium' },
    7: { cat: 'close' },
    8: { cat: 'medium' },
    9: { cat: 'medium' },
    10: { cat: 'close' },
    11: { cat: 'medium' },
    12: { cat: 'medium' },
    13: { cat: 'far' },
    15: { cat: 'close' },
    16: { cat: 'medium' },
    17: { cat: 'medium' },
    18: { cat: 'medium' },
  }
};

export function generateDefaultSubmissions(students: Student[] = DEFAULT_STUDENTS): SurveySubmission[] {
  const result: SurveySubmission[] = [];
  const now = Date.now();

  // Generate 2회차 submissions from MATRIX
  students.forEach((student) => {
    const sNum = student.number || 1;
    const matRow = MATRIX_ROUND_2[sNum];
    
    if (matRow) {
      const placements: Record<string, { category: 'close' | 'medium' | 'far'; reason?: string }> = {};
      const wishFriendIds: string[] = [];

      Object.entries(matRow).forEach(([targetNumStr, info]) => {
        const targetNum = parseInt(targetNumStr, 10);
        const targetStudent = students.find((s) => s.number === targetNum);
        if (targetStudent && targetStudent.id !== student.id) {
          if (info.cat) {
            placements[targetStudent.id] = {
              category: info.cat,
              reason: info.reason
            };
          }
          if (info.wish) {
            wishFriendIds.push(targetStudent.id);
          }
        }
      });

      result.push({
        id: `sub-r2-${student.id}`,
        round: 2,
        studentId: student.id,
        studentName: student.name,
        studentGender: student.gender,
        className: '우리반',
        timestamp: now - 1000 * 60 * 60 * 2, // 2 hours ago
        placements,
        wishFriendIds
      });
    }
  });

  // Generate 1회차 submissions (slightly earlier baseline for trend analysis)
  students.forEach((student) => {
    const sNum = student.number || 1;
    const placements: Record<string, { category: 'close' | 'medium' | 'far'; reason?: string }> = {};
    const wishFriendIds: string[] = [];

    // Simple baseline for round 1
    students.forEach((target) => {
      if (target.id === student.id) return;
      const tNum = target.number || 1;
      
      // Some realistic variation for round 1
      if ((sNum + tNum) % 4 === 0) {
        placements[target.id] = { category: 'close', reason: '학기 초에 친해짐' };
      } else if ((sNum + tNum) % 7 === 0) {
        placements[target.id] = { category: 'far', reason: '아직 잘 모름' };
      } else {
        placements[target.id] = { category: 'medium' };
      }
    });

    result.push({
      id: `sub-r1-${student.id}`,
      round: 1,
      studentId: student.id,
      studentName: student.name,
      studentGender: student.gender,
      className: '우리반',
      timestamp: now - 1000 * 60 * 60 * 24 * 30, // 30 days ago
      placements,
      wishFriendIds
    });
  });

  return result;
}
