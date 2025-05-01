"use client";

import { useState } from "react";
import * as api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Course } from "@/generated/openapi-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const DEFAULT_DESCRIPTION = `
<h2>논길을 끄는 간결한 제목을 작성해보세요</h2>

<p>강의를 통해 무엇을 배울 수 있는지, 어떤 분야에서 주로 사용되는지 등을 설명해주세요.</p>

<ul>
  <li>구체적인 이미지나 그래프 등 참고할 수 있는 자료,</li>
  <li>그리고 자신만의 강의 기획 배경이 있으면 더 효과적으로 수강생을 설득할 수 있어요.</li>
</ul>

<h2>이런 내용을 배워요</h2>

<h3>섹션 (1) 핵심 키워드</h3>

<p>학습 목표에 따라 배우는 내용을 꼼꼼하게 설명해주세요.</p>
<p>수업 스크린샷이나 예시 이미지, 도표 등 시각 자료를 활용하면 더욱 매력적인 소개를 만들 수 있어요.</p>

<h3>수강 전 참고 사항</h3>

<h4>실습 환경</h4>
<ul>
  <li>운영 체제 및 버전(OS): Windows, macOS, Linux, Ubuntu, Android, iOS 등 OS 종류 및 버전</li>
  <li>사용 도구: 실습에 필요한 소프트웨어/하드웨어 버전 및 관련 플랫폼, 가상머신 사용 여부 등</li>
  <li>PC 사양: CPU, 메모리, 디스크, 그래픽카드 등 프로그램 구동을 위한 권장 사양 등</li>
</ul>

<h4>학습 자료</h4>
<ul>
  <li>제공하는 학습 자료 형식 (PPT, 클라우드 링크, 텍스트, 소스 코드, 예셋, 프로그램, 예제 문제 등)</li>
  <li>분량 및 용량, 기타 학습 자료에 대한 특징 및 유의사항 등</li>
</ul>

<h4>선수 지식 및 유의사항</h4>
<ul>
  <li>학습 난이도를 고려한 필수 선수 지식 여부</li>
  <li>강의 영상 품질(음질/화질) 등 수강과 직접 연관된 내용 및 권장 학습 방법</li>
  <li>질문/답변 및 추후 업데이트 관련 내용</li>
  <li>강의 및 학습 자료 저작권 관련 공지사항</li>
</ul>
`;
const CKEditor = dynamic(() => import("@/components/ckeditor"), {
  ssr: false,
});

export default function UI({ course }: { course: Course }) {
  const queryClient = useQueryClient();
  const [courseDescription, setCourseDescription] = useState<string>(
    course.description || DEFAULT_DESCRIPTION
  );

  const updateCourseDescriptionMutation = useMutation({
    mutationFn: () =>
      api.updateCourse(course.id, { description: courseDescription }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course", course.id],
      });
      toast.success("강의 설명 업데이트를 성공적으로 완료했습니다.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="w-full flex flex-col items-end gap-2">
      <CKEditor value={courseDescription} onChange={setCourseDescription} />
      <Button
        onClick={() => updateCourseDescriptionMutation.mutate()}
        size="lg"
        className="font-bold"
      >
        {updateCourseDescriptionMutation.isPending
          ? "저장중..."
          : "상세소개 저장"}
      </Button>
    </div>
  );
}
