"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { CourseQuestion } from "@/generated/openapi-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const CKEditor = dynamic(() => import("@/components/ckeditor"), {
  ssr: false,
});

export default function CreateQuestionModal({
  courseId,
  isOpen,
  onClose,
  editingQuestion,
}: {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  editingQuestion?: CourseQuestion;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editingQuestion) {
        setTitle(editingQuestion.title);
        setContent(editingQuestion.content);
      } else {
        setTitle("");
        setContent("");
      }
    }
  }, [isOpen, editingQuestion]);

  const createQuestionMutation = useMutation({
    mutationFn: () =>
      api.createQuestion(courseId, {
        title,
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["questions", courseId],
      });
      toast.success("질문이 등록되었습니다.");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "질문 등록에 실패했습니다.");
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: () =>
      api.updateQuestion(editingQuestion!.id, {
        title,
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["questions", courseId],
      });
      toast.success("질문이 수정되었습니다.");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "질문 수정에 실패했습니다.");
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    if (editingQuestion) {
      updateQuestionMutation.mutate();
    } else {
      createQuestionMutation.mutate();
    }
  };

  const isLoading =
    createQuestionMutation.isPending || updateQuestionMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingQuestion ? "질문 수정하기" : "새 질문 작성하기"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              placeholder="질문 제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">내용</Label>
            <div className="min-h-[300px]">
              <CKEditor value={content} onChange={setContent} />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {editingQuestion ? "수정하기" : "등록하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
