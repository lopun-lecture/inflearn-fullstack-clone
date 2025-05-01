"use client";

import { Button } from "@/components/ui/button";
import { Course } from "@/generated/openapi-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import * as api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function EditCourseHeader({ course }: { course: Course }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const publishCourseMutation = useMutation({
    mutationFn: () =>
      api.updateCourse(course.id, {
        status: "PUBLISHED",
      }),
    onSuccess: (res) => {
      toast.success("강의가 성공적으로 게시되었습니다.");
      router.refresh();
      queryClient.invalidateQueries({
        queryKey: ["course", course.id],
      });
    },
    onError: () => {
      toast.error("강의 게시에 실패했습니다.");
    },
  });

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white">
      <h2 className="text-2xl font-bold">{course.title}</h2>
      <div className="flex items-center gap-2">
        <Button
          disabled={
            publishCourseMutation.isPending || course.status === "PUBLISHED"
          }
          onClick={() => publishCourseMutation.mutate()}
          size={"lg"}
        >
          {publishCourseMutation.isPending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : course.status === "PUBLISHED" ? (
            <span>제출완료</span>
          ) : (
            <span>제출하기</span>
          )}
        </Button>
        <Button
          onClick={() => router.push("/instructor/courses")}
          size="lg"
          variant={"outline"}
        >
          <X size={20} />
        </Button>
      </div>
    </header>
  );
}
