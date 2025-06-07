export default function slugify(input: string): string {
  return (
    input
      // 1. . 또는 공백 계열을 모두 하이픈으로 변환
      .replace(/[.\s\u00A0\u202F\u2000-\u200B]+/g, '-')
      // 2. 한글, 영문, 숫자, 하이픈 외 모든 문자 제거
      .replace(/[^\p{L}\p{N}-]/gu, '')
      // 3. 연속된 하이픈은 하나로 치환
      .replace(/-+/g, '-')
      // 4. 시작과 끝의 하이픈 제거
      .replace(/^-+|-+$/g, '')
  );
}
