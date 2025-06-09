import { SearchCourseDto } from "@/generated/openapi-client";
import * as api from "@/lib/api";
import CourseCard from "./course-card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { auth } from "@/auth";

interface CourseListProps extends SearchCourseDto {
  baseUrl?: string;
}

export default async function CourseList({
  q,
  category,
  priceRange,
  sortBy = "price",
  order = "asc",
  page = 1,
  pageSize = 20,
  baseUrl = "",
}: CourseListProps) {
  const session = await auth();

  const { data, error } = await api.searchCourses({
    q,
    category,
    priceRange,
    sortBy,
    order,
    page,
    pageSize,
  });

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">
            에러가 발생했습니다
          </p>
          <p className="mt-2 text-sm text-gray-500">
            잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  if (!data?.courses || data.courses.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">
            강의를 찾을 수 없습니다
          </p>
          <p className="mt-2 text-sm text-gray-500">
            다른 검색어를 시도해보세요.
          </p>
        </div>
      </div>
    );
  }

  const buildPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page_number", pageNumber.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const renderPaginationNumbers = () => {
    const items = [];
    const { currentPage, totalPages } = data.pagination;
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 첫 페이지
    if (startPage > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink href={buildPageUrl(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    // 현재 페이지 근처 페이지들
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink href={buildPageUrl(i)} isActive={i === currentPage}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // 마지막 페이지
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink href={buildPageUrl(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="w-full">
      {/* 강의 목록 Grid */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {data.courses.map((course) => (
          <CourseCard key={course.id} course={course} user={session?.user} />
        ))}
      </div>

      {/* 페이지네이션 */}
      {data.pagination.totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination>
            <PaginationContent>
              {data.pagination.hasPrev && (
                <PaginationItem>
                  <PaginationPrevious
                    href={buildPageUrl(data.pagination.currentPage - 1)}
                  />
                </PaginationItem>
              )}

              {renderPaginationNumbers()}

              {data.pagination.hasNext && (
                <PaginationItem>
                  <PaginationNext
                    href={buildPageUrl(data.pagination.currentPage + 1)}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
