"use client";

import { useState, useMemo } from "react";
import { User } from "next-auth";
import { CourseQuestion } from "@/generated/openapi-client";
import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, PlusIcon, MessageSquareIcon } from "lucide-react";
import CreateQuestionModal from "./create-question-modal";
import QuestionDetailModal from "./question-detail-modal";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function QuestionCard({
  question,
  onClick,
}: {
  question: CourseQuestion;
  onClick: () => void;
}) {
  const commentCount = question.comments?.length || 0;

  return (
    <div
      onClick={onClick}
      className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors mb-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm mb-1 line-clamp-1">
            {question.title}
          </h3>
          <div
            className="text-xs text-gray-600 mb-2 line-clamp-2"
            dangerouslySetInnerHTML={{
              __html: question.content.replace(/<[^>]*>/g, ""),
            }}
          />
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{question.user?.name || "익명"}</span>
            <span>{formatDate(question.createdAt)}</span>
            {commentCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquareIcon className="size-3" />
                <span>{commentCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuestionsSection({
  courseId,
  user,
}: {
  courseId: string;
  user?: User;
}) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<
    CourseQuestion | undefined
  >();

  const {
    data: questions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["questions", courseId],
    queryFn: () => api.findAllQuestions(courseId),
    select: (response) => response.data || [],
  });

  const filteredQuestions = useMemo(() => {
    if (!searchKeyword.trim()) return questions;

    const keyword = searchKeyword.toLowerCase();
    return questions.filter(
      (question) =>
        question.title.toLowerCase().includes(keyword) ||
        question.content.toLowerCase().includes(keyword)
    );
  }, [questions, searchKeyword]);

  const handleQuestionClick = (question: CourseQuestion) => {
    setSelectedQuestion(question);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedQuestion(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-xs text-gray-500">질문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-sm">질문을 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">질문&답변</h3>
        {user && (
          <Button
            onClick={() => setShowCreateModal(true)}
            size="sm"
            className="flex items-center gap-1 text-xs"
          >
            <PlusIcon className="size-3" />
            질문하기
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 size-3" />
        <Input
          placeholder="질문 검색..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="pl-7 text-xs h-8"
        />
      </div>

      {/* Questions List */}
      <div className="space-y-2">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquareIcon className="size-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-xs mb-2">
              {searchKeyword.trim()
                ? "검색 결과가 없습니다."
                : "아직 질문이 없습니다."}
            </p>
            {!searchKeyword.trim() && user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className="mt-2 text-xs"
              >
                첫 질문을 남겨보세요
              </Button>
            )}
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onClick={() => handleQuestionClick(question)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <CreateQuestionModal
        courseId={courseId}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {selectedQuestion && (
        <QuestionDetailModal
          question={selectedQuestion}
          user={user}
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
}
