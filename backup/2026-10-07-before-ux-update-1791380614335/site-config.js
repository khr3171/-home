// 구글 폼 등 실제 접수 주소를 따옴표 사이에 넣으세요.
// 주소가 비어 있으면 '신청 준비 중' 안내가 표시됩니다.
// 접수가 끝나면 주소를 비우세요. 현재 모집 중일 때만 주소를 연결하세요.
window.SITE_CONFIG = {
  diagnosis: { url: "", label: "진단검사 신청하기" },
  education: { url: "", label: "자립교육 신청하기" },
  // 실제 상담 번호로 바꾸고 isTemporary를 false로 바꾸면 전화 버튼이 표시됩니다.
  contact: { number: "051-000-0000", isTemporary: true }
};
