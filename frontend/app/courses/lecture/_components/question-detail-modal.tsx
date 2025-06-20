"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { CourseQuestion, CourseComment } from "@/generated/openapi-client";
import { User } from "next-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
  SendIcon,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import CreateQuestionModal from "./create-question-modal";

const CKEditor = dynamic(() => import("@/components/ckeditor"), {
  ssr: false,
});

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CommentItem({
  comment,
  user,
  onEdit,
  onDelete,
  editingCommentId,
  editingContent,
  onEditingContentChange,
  onSaveEdit,
  onCancelEdit,
  isUpdating,
}: {
  comment: CourseComment;
  user?: User;
  onEdit?: (comment: CourseComment) => void;
  onDelete?: (commentId: string) => void;
  editingCommentId?: string | null;
  editingContent?: string;
  onEditingContentChange?: (content: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  isUpdating?: boolean;
}) {
  const isOwner = user && comment.user?.id === user.id;
  const isEditing = editingCommentId === comment.id;

  return (
    <div className="border-b border-gray-100 pb-3 last:border-b-0 mb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1">
          {comment.user?.image && (
            <Image
              src={comment.user.image}
              alt={comment.user.name || "user"}
              width={24}
              height={24}
              className="rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-xs">
                {comment.user?.name || "익명"}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <div className="min-h-[100px]">
                  <CKEditor
                    value={editingContent || ""}
                    onChange={onEditingContentChange || (() => {})}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCancelEdit}
                    disabled={isUpdating}
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={onSaveEdit}
                    disabled={isUpdating || !editingContent?.trim()}
                    className="flex items-center gap-2"
                  >
                    {isUpdating ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <SendIcon className="size-3" />
                    )}
                    수정
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="prose prose-xs max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />
            )}
          </div>
        </div>

        {isOwner && onEdit && onDelete && !isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVerticalIcon className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(comment)}>
                <PencilIcon className="size-3 mr-2" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(comment.id)}
                variant="destructive"
              >
                <Trash2Icon className="size-3 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export default function QuestionDetailModal({
  question: initialQuestion,
  user,
  isOpen,
  onClose,
}: {
  question: CourseQuestion;
  user?: User;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // Fetch updated question data to get latest comments
  const { data: questionResponse, isLoading: questionLoading } = useQuery({
    queryKey: ["question", initialQuestion.id],
    queryFn: () => api.findOneQuestion(initialQuestion.id),
    enabled: isOpen,
  });

  const question = questionResponse?.data || initialQuestion;
  const isOwner = user && question?.user?.id === user.id;

  const createCommentMutation = useMutation({
    mutationFn: () =>
      api.createComment(question.id, {
        content: commentContent,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["question", question!.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["questions", question!.courseId],
      });
      setCommentContent("");
      toast.success("댓글이 등록되었습니다.");
    },
    onError: (error: any) => {
      toast.error(error.message || "댓글 등록에 실패했습니다.");
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: () =>
      api.updateComment(editingCommentId!, {
        content: editingContent,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["question", question!.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["questions", question!.courseId],
      });
      setEditingCommentId(null);
      setEditingContent("");
      toast.success("댓글이 수정되었습니다.");
    },
    onError: (error: any) => {
      toast.error(error.message || "댓글 수정에 실패했습니다.");
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: () => api.removeQuestion(question!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["questions", question!.courseId],
      });
      toast.success("질문이 삭제되었습니다.");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "질문 삭제에 실패했습니다.");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.removeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["question", question!.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["questions", question!.courseId],
      });
      toast.success("댓글이 삭제되었습니다.");
    },
    onError: (error: any) => {
      toast.error(error.message || "댓글 삭제에 실패했습니다.");
    },
  });

  const handleSubmitComment = () => {
    if (!commentContent.trim()) {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }
    createCommentMutation.mutate();
  };

  const handleEditQuestion = () => {
    setShowEditModal(true);
  };

  const handleDeleteQuestion = () => {
    if (confirm("정말로 이 질문을 삭제하시겠습니까?")) {
      deleteQuestionMutation.mutate();
    }
  };

  const handleEditComment = (comment: CourseComment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleSaveEdit = () => {
    if (!editingContent.trim()) {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }
    updateCommentMutation.mutate();
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  if (!question) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-lg mb-2">
                  {question.title}
                </DialogTitle>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    {question.user?.image && (
                      <Image
                        src={question.user.image}
                        alt={question.user.name || "user"}
                        width={16}
                        height={16}
                        className="rounded-full object-cover"
                      />
                    )}
                    <span>{question.user?.name || "익명"}</span>
                  </div>
                  <span>{formatDate(question.createdAt)}</span>
                </div>
              </div>

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVerticalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEditQuestion}>
                      <PencilIcon className="size-4 mr-2" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDeleteQuestion}
                      variant="destructive"
                    >
                      <Trash2Icon className="size-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Question Content */}
            <div
              className="prose max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: question.content }}
            />

            {/* Comments Section */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 text-sm">
                댓글 {question.comments?.length || 0}개
              </h4>

              {/* Comments List */}
              <div className="space-y-3 mb-4">
                {question.comments && question.comments.length > 0 ? (
                  question.comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      user={user}
                      onEdit={handleEditComment}
                      onDelete={handleDeleteComment}
                      editingCommentId={editingCommentId}
                      editingContent={editingContent}
                      onEditingContentChange={setEditingContent}
                      onSaveEdit={handleSaveEdit}
                      onCancelEdit={handleCancelEdit}
                      isUpdating={updateCommentMutation.isPending}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6 text-sm">
                    아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
                  </p>
                )}
              </div>

              {/* Comment Input */}
              {user && (
                <div className="border-t pt-3">
                  <div className="space-y-2">
                    <div className="min-h-[120px]">
                      <CKEditor
                        value={commentContent}
                        onChange={setCommentContent}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmitComment}
                        disabled={createCommentMutation.isPending}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {createCommentMutation.isPending ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <SendIcon className="size-3" />
                        )}
                        댓글 등록
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Question Modal */}
      {showEditModal && (
        <CreateQuestionModal
          courseId={question.courseId}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          editingQuestion={question}
        />
      )}
    </>
  );
}
