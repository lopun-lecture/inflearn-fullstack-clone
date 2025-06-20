"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import {
  CourseQuestion,
  QuestionWithCommentCountDto,
} from "@/generated/openapi-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SearchIcon,
  MessageSquareIcon,
  UserIcon,
  CalendarIcon,
  BookOpenIcon,
  ArrowRightIcon,
} from "lucide-react";
import Image from "next/image";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function QuestionCard({ question }: { question: QuestionWithCommentCountDto }) {
  const router = useRouter();
  const commentCount = question._count.comments || 0;

  const handleClick = () => {
    router.push(`/community/questions/${question.id}`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Question Title */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-base line-clamp-2 flex-1">
              {question.title}
            </h3>
            <ArrowRightIcon className="size-4 text-gray-400 mt-1 flex-shrink-0" />
          </div>

          {/* Question Content Preview */}
          <div
            className="text-sm text-gray-600 line-clamp-3"
            dangerouslySetInnerHTML={{
              __html: question.content.replace(/<[^>]*>/g, ""),
            }}
          />

          {/* Course Info */}
          {question.course && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <BookOpenIcon className="size-3" />
              <span className="line-clamp-1">{question.course.title}</span>
            </div>
          )}

          {/* Question Author */}
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

          {/* Meta Information */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <CalendarIcon className="size-3" />
                <span>{formatDate(question.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquareIcon className="size-3" />
                <span>댓글 {commentCount}개</span>
              </div>
            </div>

            {/* Status Badge */}
            <Badge variant={commentCount > 0 ? "default" : "secondary"}>
              {commentCount > 0 ? "답변완료" : "미답변"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function QuestionsManagementUI() {
  const [searchKeyword, setSearchKeyword] = useState("");

  const {
    data: questions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["instructor-questions"],
    queryFn: () => api.getAllInstructorQuestions(),
  });

  const filteredQuestions = useMemo(() => {
    if (!searchKeyword.trim()) return questions?.data || [];

    const keyword = searchKeyword.toLowerCase();
    return questions?.data?.filter(
      (question: QuestionWithCommentCountDto) =>
        question.title.toLowerCase().includes(keyword) ||
        question.content.toLowerCase().includes(keyword) ||
        question.user?.name?.toLowerCase().includes(keyword) ||
        question.course?.title?.toLowerCase().includes(keyword)
    );
  }, [questions, searchKeyword]);

  const unansweredCount =
    questions?.data?.filter(
      (q: QuestionWithCommentCountDto) =>
        !q._count.comments || q._count.comments === 0
    ).length || 0;

  const totalQuestions = questions?.data?.length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="container mx-auto px-4">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">질문 관리</h1>
              <p className="text-gray-600">
                학생들의 질문을 확인하고 답변을 작성하세요
              </p>
            </div>
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">질문을 불러오는 중...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="container mx-auto px-4">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">질문 관리</h1>
              <p className="text-gray-600">
                학생들의 질문을 확인하고 답변을 작성하세요
              </p>
            </div>
            <div className="text-center py-12">
              <p className="text-red-500">질문을 불러오는데 실패했습니다.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="mx-auto px-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">질문 관리</h1>
          <p className="text-gray-600">
            학생들의 질문을 확인하고 답변을 작성하세요
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                전체 질문
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuestions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                미답변 질문
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {unansweredCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                답변 완료
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalQuestions - unansweredCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquareIcon className="size-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchKeyword.trim()
                    ? "검색 결과가 없습니다."
                    : "아직 질문이 없습니다."}
                </p>
                <p className="text-sm text-gray-400">
                  {!searchKeyword.trim() &&
                    "학생들이 질문을 남기면 여기에 표시됩니다."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredQuestions?.map(
                (question: QuestionWithCommentCountDto) => (
                  <QuestionCard key={question.id} question={question} />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
