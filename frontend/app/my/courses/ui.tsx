"use client";

import { Course } from "@/generated/openapi-client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, BookOpen, User, Star, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

interface MyCoursesUIProps {
  courses: Course[];
}

export default function MyCoursesUI({ courses }: MyCoursesUIProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  // 필터링된 강의 목록
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    // 카테고리 및 상태 필터링은 추후 구현 가능
    return matchesSearch;
  });

  // 정렬된 강의 목록
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const handleCourseClick = (courseId: string) => {
    router.push(`/courses/lecture?courseId=${courseId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">내 학습</h1>
        <p className="text-gray-600">
          수강중인 강의를 확인하고 학습을 이어가세요.
        </p>
      </div>

      {sortedCourses.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-4">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              수강중인 강의가 없습니다
            </h3>
            <p className="text-gray-500">새로운 강의를 찾아보세요!</p>
          </div>
          <Button
            onClick={() => router.push("/")}
            className="bg-green-600 hover:bg-green-700"
          >
            강의 둘러보기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCourseClick(course.id)}
            >
              {/* 썸네일 */}
              <div className="relative aspect-video">
                <Image
                  src={course.thumbnailUrl || "/placeholder-course.jpg"}
                  alt={course.title}
                  fill
                  className="rounded-t-lg object-cover"
                />
                {/* 진행률 배지 */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-black/70 text-white">
                    진행률 0%
                  </Badge>
                </div>
              </div>

              {/* 강의 정보 */}
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                  {course.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {course.level}
                  </span>
                  <span>무제한</span>
                </div>

                <div className="text-xs text-gray-500 mb-2">
                  {course.instructor?.name}
                </div>

                {/* 진행률 바 */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>
                      0 /{" "}
                      {course.sections?.reduce(
                        (total, section) =>
                          total + (section.lectures?.length || 0),
                        0
                      ) || 0}
                      강
                    </span>
                    <span>0%</span>
                  </div>
                  <Progress value={0} className="h-1" />
                </div>

                {/* 가격 */}
                <div className="text-right">
                  {course.discountPrice &&
                  course.discountPrice < course.price ? (
                    <div className="text-xs text-gray-400 line-through">
                      ₩{formatPrice(course.price)}
                    </div>
                  ) : null}
                  <div className="text-sm font-bold">
                    ₩{formatPrice(course.discountPrice || course.price)}
                  </div>
                </div>
              </div>

              {/* 마지막 학습일 */}
              <div className="px-4 pb-4">
                <div className="text-xs text-gray-400">무제한</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
