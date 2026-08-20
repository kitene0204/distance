import { Student } from '../types';

// Exact 24 students matching User Screenshots (3학년 1반)
export const DEFAULT_STUDENTS: Student[] = [
  { id: 'std-1', number: 1, name: '성미희', gender: '여', grade: 3, classNum: 1 },
  { id: 'std-2', number: 2, name: '류지민', gender: '여', grade: 3, classNum: 1 },
  { id: 'std-3', number: 3, name: '서경하', gender: '남', grade: 3, classNum: 1 },
  { id: 'std-4', number: 4, name: '홍재식', gender: '남', grade: 3, classNum: 1 },
  { id: 'std-5', number: 5, name: '박태수', gender: '남', grade: 3, classNum: 1 },
  { id: 'std-6', number: 6, name: '이수혁', gender: '남', grade: 3, classNum: 1 },
  { id: 'std-7', number: 7, name: '서효은', gender: '여', grade: 3, classNum: 1 },
  { id: 'std-8', number: 8, name: '정준현', gender: '남', grade: 3, classNum: 1 },
  { id: 'std-9', number: 9, name: '윤선아', gender: '여', grade: 3, classNum: 1 },
  { id: 'std-10', number: 10, name: '손설현', gender: '여', grade: 3, classNum: 1 },
  { id: 'std-11', number: 11, name: '고종혁', gender: '남', grade: 3, classNum: 1 },
  { id: 'std-12', number: 12, name: '배세진', gender: '남', grade: 3, classNum: 1 },
  { id: 'std-13', number: 13, name: '강원숙', gender: '여', grade: 3, classNum: 1 },
  { id: 'std-14', number: 14, name: '강준호', gender: '남', grade: 3, classNum: 1 },
  { id: 'std-15', number: 15, name: '문종호', gender: '남', grade: 3, classNum: 1 },
  { id: 'std-16', number: 16, name: '표영혜', gender: '여', grade: 3, classNum: 1 },
  { id: 'std-17', number: 17, name: '김석희', gender: '남', grade: 3, classNum: 1 },
  { id: 'std-18', number: 18, name: '송재진', gender: '남', grade: 3, classNum: 1 },
  { id: 'std-19', number: 19, name: '오민지', gender: '여', grade: 3, classNum: 1 },
  { id: 'std-20', number: 20, name: '안지훈', gender: '남', grade: 3, classNum: 1 },
  { id: 'std-21', number: 21, name: '윤재민', gender: '남', grade: 3, classNum: 1 },
  { id: 'std-22', number: 22, name: '홍혜진', gender: '여', grade: 3, classNum: 1 },
  { id: 'std-23', number: 23, name: '서기준', gender: '남', grade: 3, classNum: 1 },
  { id: 'std-24', number: 24, name: '황기원', gender: '남', grade: 3, classNum: 1 },
];

export const AVAILABLE_CLASSES = [
  { id: 'class-3-1', name: '3학년1반', count: 24 },
  { id: 'class-test', name: '테스트반', count: 15 },
  { id: 'class-3-2', name: '우리반 (3-2)', count: 19 },
];

export const STORAGE_KEYS = {
  ROSTER: 'mind_distance_roster_v2',
  CLASS_NAME: 'mind_distance_class_name_v2',
  CURRENT_STUDENT: 'mind_distance_current_student_v2',
  SAVED_RESPONSES: 'mind_distance_responses_v2',
  ACTIVE_NAV: 'mind_distance_active_nav_v2',
  SELECTED_ROUND: 'mind_distance_selected_round_v2',
};
