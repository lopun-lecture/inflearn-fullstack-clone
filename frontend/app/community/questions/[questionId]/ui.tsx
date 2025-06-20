"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { CourseQuestion, CourseComment } from "@/generated/openapi-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  BookOpenIcon,
  MessageSquareIcon,
} from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { User } from "next-auth";

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
  currentUserId,
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
  currentUserId?: string;
  onEdit?: (comment: CourseComment) => void;
  onDelete?: (commentId: string) => void;
  editingCommentId?: string | null;
  editingContent?: string;
  onEditingContentChange?: (content: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  isUpdating?: boolean;
}) {
  const isOwner = currentUserId && comment.user?.id === currentUserId;
  const isEditing = editingCommentId === comment.id;

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0 mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {comment.user?.image ? (
            <Image
              src={comment.user.image}
              alt={comment.user.name || "사용자"}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <UserIcon className="size-8 p-1 bg-gray-100 rounded-full" />
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">
                {comment.user?.name || "익명 사용자"}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div className="min-h-[120px]">
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
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />
            )}
          </div>
        </div>

        {isOwner && onEdit && onDelete && !isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(comment)}>
                <PencilIcon className="size-4 mr-2" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(comment.id)}
                variant="destructive"
              >
                <Trash2Icon className="size-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export default function QuestionDetailPageUI({
  questionId,
  user,
}: {
  questionId: string;
  user: User;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // TODO: API 구현 필요 - 특정 질문 조회
  const { data: questionResponse, isLoading: questionLoading } = useQuery({
    queryKey: ["question", questionId],
    queryFn: async () => api.findOneQuestion(questionId),
    enabled: !!questionId,
  });

  const question = questionResponse?.data as CourseQuestion | null;

  const createCommentMutation = useMutation({
    mutationFn: () =>
      api.createComment(questionId, {
        content: commentContent,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["question", questionId],
      });
      setCommentContent("");
      toast.success("답변이 등록되었습니다.");
    },
    onError: (error: any) => {
      toast.error(error.message || "답변 등록에 실패했습니다.");
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: () =>
      api.updateComment(editingCommentId!, {
        content: editingContent,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["question", questionId],
      });
      setEditingCommentId(null);
      setEditingContent("");
      toast.success("답변이 수정되었습니다.");
    },
    onError: (error: any) => {
      toast.error(error.message || "답변 수정에 실패했습니다.");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.removeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["question", questionId],
      });
      toast.success("답변이 삭제되었습니다.");
    },
    onError: (error: any) => {
      toast.error(error.message || "답변 삭제에 실패했습니다.");
    },
  });

  const handleSubmitComment = () => {
    if (!commentContent.trim()) {
      toast.error("답변 내용을 입력해주세요.");
      return;
    }
    createCommentMutation.mutate();
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
      toast.error("답변 내용을 입력해주세요.");
      return;
    }
    updateCommentMutation.mutate();
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm("정말로 이 답변을 삭제하시겠습니까?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (questionLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">질문을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">질문을 찾을 수 없습니다.</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeftIcon className="size-4 mr-2" />
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const commentCount = question.comments?.length || 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={handleBack} variant="ghost" className="mb-4 pl-0">
          <ArrowLeftIcon className="size-4 mr-2" />
          질문 목록으로
        </Button>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="space-y-4">
            {/* Question Title */}
            <h1 className="text-2xl font-bold">{question.title}</h1>

            {/* Question Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Author */}
                <div className="flex items-center gap-2">
                  {question.user?.image ? (
                    <Image
                      src={question.user.image}
                      alt={question.user.name || "사용자"}
                      width={24}
                      height={24}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="size-6 p-1 bg-gray-100 rounded-full" />
                  )}
                  <span className="text-sm font-medium">
                    {question.user?.name || "익명 사용자"}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <CalendarIcon className="size-4" />
                  <span>{formatDate(question.createdAt)}</span>
                </div>

                {/* Course */}
                {question.course && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <BookOpenIcon className="size-4" />
                    <span className="line-clamp-1">
                      {question.course.title}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <Badge variant={commentCount > 0 ? "default" : "secondary"}>
                {commentCount > 0 ? "답변완료" : "미답변"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Question Content */}
          <div
            className="prose max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: question.content }}
          />
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquareIcon className="size-5" />
            <h2 className="text-lg font-semibold">답변 {commentCount}개</h2>
          </div>
        </CardHeader>

        <CardContent>
          {/* Comments List */}
          <div className="space-y-4 mb-6">
            {question.comments && question.comments.length > 0 ? (
              question.comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={user.id}
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
              <div className="text-center py-8">
                <MessageSquareIcon className="size-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  아직 답변이 없습니다. 첫 답변을 남겨보세요!
                </p>
              </div>
            )}
          </div>

          {/* Comment Input */}
          {user && (
            <div className="border-t pt-6">
              <h3 className="font-medium mb-3">답변 작성</h3>
              <div className="space-y-3">
                <div className="min-h-[150px]">
                  <CKEditor
                    value={commentContent}
                    onChange={setCommentContent}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={createCommentMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {createCommentMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <SendIcon className="size-4" />
                    )}
                    답변 등록
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
