"use client";

import { useState } from "react";
import { User } from "next-auth";
import { CourseReview as CourseReviewEntity } from "@/generated/openapi-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, MessageSquare, Edit2, Trash2 } from "lucide-react";
import * as api from "@/lib/api";

export default function UI({
  user,
  reviews,
}: {
  user: User;
  reviews: CourseReviewEntity[];
}) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const queryClient = useQueryClient();

  // 답글 생성/수정 mutation
  const replyMutation = useMutation({
    mutationFn: async ({
      reviewId,
      reply,
    }: {
      reviewId: string;
      reply: string;
    }) => api.createInstructorReply(reviewId, { instructorReply: reply }),
    onSuccess: () => {
      window.location.reload();
    },
  });

  // 답글 삭제 mutation
  const deleteReplyMutation = useMutation({
    mutationFn: async (reviewId: string) =>
      api.createInstructorReply(reviewId, { instructorReply: "" }),
    onSuccess: () => {
      window.location.reload();
    },
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleReplySubmit = (reviewId: string) => {
    if (!replyText.trim()) return;
    replyMutation.mutate({ reviewId, reply: replyText });
  };

  const handleEditClick = (reviewId: string, currentReply: string) => {
    setEditingReply(reviewId);
    setReplyText(currentReply);
    setReplyingTo(null);
  };

  const handleReplyClick = (reviewId: string) => {
    setReplyingTo(reviewId);
    setReplyText("");
    setEditingReply(null);
  };

  const handleCancel = () => {
    setReplyingTo(null);
    setEditingReply(null);
    setReplyText("");
  };

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">수강평 관리</h1>

      <div className="space-y-3">
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-4">
              {/* 리뷰 헤더 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating || 0)}
                    <span className="text-sm text-gray-600 ml-1">
                      {review.rating}점
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(review.createdAt || "").toLocaleDateString()}
                </div>
              </div>

              {/* 리뷰 내용 */}
              <div className="mb-3">
                <p className="text-gray-800 mb-2 leading-relaxed">
                  {review.content}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>글쓴이: {review.user?.name || "익명"}</span>
                  <span>
                    강의명: {review.course?.title || "강의 정보 없음"}
                  </span>
                </div>
              </div>

              {/* 기존 답글 표시 */}
              {review.instructorReply && editingReply !== review.id && (
                <div className="border-l-2 border-blue-500 pl-3 mb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">
                          지식공유자 답글
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {review.instructorReply}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          handleEditClick(review.id, review.instructorReply!)
                        }
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => deleteReplyMutation.mutate(review.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 답글 작성/수정 폼 */}
              {(replyingTo === review.id || editingReply === review.id) && (
                <div className="border-l-2 border-blue-500 pl-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      {editingReply === review.id
                        ? "답글 수정하기"
                        : "답글 작성하기"}
                    </span>
                  </div>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="수강생에게 답글을 남겨주세요."
                    className="mb-2 text-sm"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleReplySubmit(review.id)}
                      disabled={!replyText.trim() || replyMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 h-8 px-3 text-sm"
                    >
                      {editingReply === review.id ? "수정" : "저장"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="h-8 px-3 text-sm"
                    >
                      취소
                    </Button>
                  </div>
                </div>
              )}

              {/* 답글 달기 버튼 */}
              {!review.instructorReply &&
                replyingTo !== review.id &&
                editingReply !== review.id && (
                  <Button
                    variant="outline"
                    onClick={() => handleReplyClick(review.id)}
                    className="gap-2 h-8 px-3 text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    답글 달기
                  </Button>
                )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            수강평이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
