"use client";

import {
  CourseDetailDto,
  Section as SectionEntity,
  Lecture as LectureEntity,
  CourseReview as CourseReviewEntity,
  User as UserEntity,
} from "@/generated/openapi-client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import {
  StarIcon,
  PlayCircleIcon,
  LockIcon,
  ShoppingCartIcon,
  HeartIcon,
  Loader2,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getLevelText } from "@/lib/level";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { User } from "next-auth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

/*****************
 * Helper Utils  *
 *****************/
function formatSecondsToMinSec(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

function formatSecondsToHourMin(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs === 0) return `${mins}분`;
  return `${hrs}시간 ${mins}분`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const mockInstructorStats = {
  students: 1234,
  reviews: 56,
  courses: 3,
  answers: 10,
};

/*****************
 * Sub Components *
 *****************/
function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={cn(
            "size-4",
            i < rounded
              ? "fill-yellow-400 stroke-yellow-400"
              : "stroke-muted-foreground"
          )}
        />
      ))}
    </div>
  );
}

function InteractiveStarRating({
  rating,
  onRatingChange,
}: {
  rating: number;
  onRatingChange: (rating: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const isActive = starValue <= (hoverRating || rating);

        return (
          <button
            key={i}
            type="button"
            onClick={() => onRatingChange(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 transition-colors"
          >
            <StarIcon
              className={cn(
                "size-8 transition-colors",
                isActive
                  ? "fill-yellow-400 stroke-yellow-400"
                  : "stroke-gray-300 hover:stroke-yellow-400"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

function ReviewModal({
  courseId,
  isOpen,
  onClose,
  setShowReviewModal,
  editingReview,
}: {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  setShowReviewModal: (show: boolean) => void;
  editingReview?: CourseReviewEntity;
}) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      if (editingReview) {
        setRating(editingReview.rating);
        setContent(editingReview.content);
      } else {
        setRating(0);
        setContent("");
      }
    }
  }, [isOpen, editingReview]);

  const createReviewMutation = useMutation({
    mutationFn: () =>
      api.createReview(courseId, {
        content,
        rating,
      }),
    onSuccess: () => {
      toast.success("수강평이 등록되었습니다.");
      setShowReviewModal(false);
      window.location.reload();
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: () =>
      api.updateReview(editingReview!.id, {
        content,
        rating,
      }),
    onSuccess: () => {
      toast.success("수강평이 수정되었습니다.");
      setShowReviewModal(false);
      window.location.reload();
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      alert("별점을 선택해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("수강평을 작성해주세요.");
      return;
    }

    if (editingReview) {
      updateReviewMutation.mutate();
    } else {
      createReviewMutation.mutate();
    }
  };

  const isLoading =
    createReviewMutation.isPending || updateReviewMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            {editingReview
              ? "수강평 수정하기"
              : "힘이 되는 수강평을 남겨주세요!"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <InteractiveStarRating rating={rating} onRatingChange={setRating} />
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="수강평을 작성해보세요!"
            className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <DialogFooter className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <span>{editingReview ? "수정하기" : "저장하기"}</span>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">수강평 삭제</DialogTitle>
          <DialogDescription className="text-center">
            정말로 이 수강평을 삭제하시겠습니까?
            <br />
            삭제된 수강평은 복구할 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "삭제"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Header({ course }: { course: CourseDetailDto }) {
  return (
    <header className="relative text-white rounded-md p-8 flex flex-col-reverse md:flex-row md:items-center gap-6">
      <div className="absolute bg-[#0F1415] top-0 bottom-0 w-screen left-1/2 -translate-x-1/2 -z-10"></div>
      {/* Left */}
      <div className="flex-1">
        {course.categories?.[0] && (
          <p className="text-sm text-muted-foreground mb-1">
            {course.categories[0].name}
          </p>
        )}
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{course.title}</h1>
        {course.shortDescription && (
          <p className="text-lg text-muted-foreground mb-4">
            {course.shortDescription}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
          <StarRating rating={course.averageRating} />
          <span className="font-medium">{course.averageRating.toFixed(1)}</span>
          <span className="text-muted-foreground">
            ({course.totalReviews}개 수강평)
          </span>
          <span className="hidden md:inline">·</span>
          <span>수강생 {course.totalEnrollments.toLocaleString()}명</span>
        </div>
        <p className="text-sm text-muted-foreground">
          by {course.instructor.name}
        </p>
      </div>
      {/* Thumbnail */}
      {course.thumbnailUrl && (
        <div className="relative w-full md:w-64 flex-shrink-0">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            width={256}
            height={144}
            className="rounded-md w-full h-auto object-cover"
          />
          {/* Play button overlay */}
          <button
            className="absolute inset-0 flex items-center justify-center"
            aria-label="preview"
          >
            <PlayCircleIcon className="size-16 text-white/90 drop-shadow-lg" />
          </button>
        </div>
      )}
    </header>
  );
}

function LatestReviews({ reviews }: { reviews: CourseReviewEntity[] }) {
  if (!reviews.length) return null;
  const latest = [...reviews]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 4);

  // grid positions for 4 quadrants
  const positions: [number, number][] = [
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2],
  ];

  return (
    <section className="mb-8">
      <h3 className="text-xl font-semibold mb-4">최근 리뷰</h3>
      <div
        className={cn(
          "grid grid-cols-2 gap-4",
          latest.length > 2 && "grid-rows-2"
        )}
      >
        {latest.map((r, idx) => {
          const [col, row] = positions[latest.length === 1 ? 0 : idx];
          return (
            <div
              key={r.id}
              style={{ gridColumnStart: col, gridRowStart: row }}
              className="border rounded-md p-4 flex flex-col gap-2 bg-white"
            >
              <div className="flex items-center gap-2">
                {r.user?.image && (
                  <Image
                    src={r.user.image}
                    alt={r.user.name || "user"}
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                )}
                <span className="text-sm font-medium">
                  {r.user?.name ?? "익명"}
                </span>
                <StarRating rating={r.rating} />
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1">
                {r.content}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Introduction({ course }: { course: CourseDetailDto }) {
  return (
    <section id="introduction" className="">
      <h2 className="text-2xl font-bold mb-6">강의 소개</h2>
      <LatestReviews reviews={course.reviews} />
      {course.description && (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: course.description }}
        />
      )}
    </section>
  );
}

function LectureRow({
  courseId,
  lecture,
  className,
}: {
  courseId: string;
  lecture: LectureEntity;
  className?: string;
}) {
  const router = useRouter();
  return (
    <div
      onClick={() => {
        router.push(
          `/courses/lecture?courseId=${courseId}&lectureId=${lecture.id}`
        );
      }}
      className={cn(
        "flex items-center justify-between text-sm px-4 py-3",
        lecture.videoStorageInfo && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {lecture.isPreview ? (
          <PlayCircleIcon className="size-4 text-primary" />
        ) : (
          <LockIcon className="size-4 text-muted-foreground" />
        )}
        <span className={lecture.videoStorageInfo && "underline"}>
          {lecture.title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {lecture.isPreview && (
          <button className="cursor-pointer text-sm px-2 py-1 border border-gray-400 text-gray-800 font-semibold rounded-md">
            미리보기
          </button>
        )}
        <span>{formatSecondsToMinSec(lecture.duration ?? 0)}</span>
      </div>
    </div>
  );
}

function Curriculum({
  courseId,
  sections,
}: {
  courseId: string;
  sections: SectionEntity[];
}) {
  return (
    <section id="curriculum" className="mt-12">
      <h2 className="text-2xl font-bold mb-6">커리큘럼</h2>
      <div className="border rounded-md bg-[#F8F9FA] overflow-hidden">
        <Accordion type="multiple" className="w-full">
          {sections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="border-b last:border-b-0"
            >
              <AccordionTrigger className="flex text-base font-medium bg-[#F8F9FA] px-4 py-3">
                <span className="flex-1">{section.title}</span>
                <span className="ml-2 text-md font-medium">
                  {section.lectures.length}개
                </span>
              </AccordionTrigger>
              <AccordionContent className="bg-white">
                <div className="flex flex-col">
                  {section.lectures
                    .sort((a, b) => a.order - b.order)
                    .map((lecture, idx) => (
                      <LectureRow
                        key={lecture.id}
                        courseId={courseId}
                        lecture={lecture}
                        className={cn(
                          "h-12",
                          idx !== section.lectures.length - 1 &&
                            "border-b border-gray-200"
                        )}
                      />
                    ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function ReviewsSection({ courseId, user }: { courseId: string; user?: User }) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<
    "latest" | "oldest" | "rating_high" | "rating_low"
  >("latest");
  const [hasNext, setHasNext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<
    CourseReviewEntity | undefined
  >();
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const pageSize = 10;
  const [totalReviews, setTotalReviews] = useState<CourseReviewEntity[]>([]);
  const [myReviewExists, setMyReviewExists] = useState(false);
  const router = useRouter();

  const loadReviews = useCallback(
    async (pageNumber: number, reset = false) => {
      setIsLoading(true);
      try {
        const res = await api.getCourseReviews(
          courseId,
          pageNumber,
          pageSize,
          sort
        );
        if (res.data?.reviews) {
          setTotalReviews((existingReviews) =>
            reset
              ? res.data!.reviews
              : [...existingReviews, ...res.data!.reviews]
          );
          setHasNext(res.data.hasNext);
          setMyReviewExists(res.data.myReviewExists);
        }
      } catch (error) {
        console.error("Failed to load reviews:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [courseId, sort, pageSize]
  );

  useEffect(() => {
    loadReviews(1, true);
    setPage(1);
  }, [loadReviews]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadReviews(nextPage, false);
  };

  const handleEditReview = (review: CourseReviewEntity) => {
    setEditingReview(review);
    setShowReviewModal(true);
  };

  const handleDeleteReview = (reviewId: string) => {
    setDeletingReviewId(reviewId);
    setShowDeleteDialog(true);
  };

  const deleteReviewMutation = useMutation({
    mutationFn: () => api.deleteReview(deletingReviewId!),
    onSuccess: () => {
      toast.success("수강평이 삭제되었습니다.");
      setShowDeleteDialog(false);
      setDeletingReviewId(null);
      window.location.reload();
    },
    onError: () => {
      toast.error("수강평 삭제에 실패했습니다.");
    },
  });

  const confirmDeleteReview = () => {
    deleteReviewMutation.mutate();
  };

  const handleCloseModal = () => {
    setShowReviewModal(false);
    setEditingReview(undefined);
  };

  return (
    <section id="reviews" className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">수강평</h2>
        {user && !myReviewExists && (
          <button
            onClick={() => setShowReviewModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
          >
            수강평 남기기
          </button>
        )}
      </div>

      <div className="space-y-8">
        {totalReviews.map((r) => (
          <div key={r.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {r.user?.image && (
                  <Image
                    src={r.user.image}
                    alt={r.user.name || "user"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{r.user?.name ?? "익명"}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <StarRating rating={r.rating} />
                    <span>{formatDate(r.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* 수정/삭제 버튼 - 본인 리뷰만 */}
              {user && r.user?.id === user.id && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditReview(r)}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(r.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {r.content}
            </p>
            {r.instructorReply && (
              <div className="ml-10 border-l-2 pl-4 border-primary">
                <p className="font-medium mb-1 text-primary">지식공유자 답변</p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {r.instructorReply}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {hasNext && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className={cn(
              "px-6 py-2 text-sm font-medium border border-gray-300 rounded-md transition-colors",
              isLoading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"
            )}
          >
            {isLoading ? "로딩 중..." : "더보기"}
          </button>
        </div>
      )}

      <ReviewModal
        courseId={courseId}
        isOpen={showReviewModal}
        onClose={handleCloseModal}
        setShowReviewModal={setShowReviewModal}
        editingReview={editingReview}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingReviewId(null);
        }}
        onConfirm={confirmDeleteReview}
        isLoading={deleteReviewMutation.isPending}
      />
    </section>
  );
}

function InstructorBio({ instructor }: { instructor: UserEntity }) {
  return (
    <>
      <hr className="border-t border-gray-200 my-12" />
      <section id="instructor" className="">
        <h2 className="text-2xl font-bold mb-6">지식공유자 소개</h2>
        <div className="flex gap-4">
          {instructor.image && (
            <Image
              src={instructor.image}
              alt={instructor.name || "instructor"}
              width={80}
              height={80}
              className="rounded-full object-cover w-20 h-20"
            />
          )}
          <div>
            <h3 className="text-lg font-medium mb-2">{instructor.name}</h3>
            {instructor.bio && (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: instructor.bio }}
              />
            )}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
              <span>
                수강생 {mockInstructorStats.students.toLocaleString()}명
              </span>
              <span>수강평 {mockInstructorStats.reviews}개</span>
              <span>답변 {mockInstructorStats.answers}개</span>
              <span>강의 {mockInstructorStats.courses}개</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FloatingMenu({
  user,
  course,
}: {
  user?: User;
  course: CourseDetailDto;
}) {
  const [isEnrolled, setIsEnrolled] = useState(course.isEnrolled);
  const [showEnrollSuccessDialog, setShowEnrollSuccessDialog] = useState(false);
  const router = useRouter();

  const getFavoriteQuery = useQuery({
    queryKey: ["favorite", course.id],
    queryFn: () => api.getFavorite(course.id),
  });

  const handleCart = useCallback(() => {
    alert("장바구니 기능은 준비 중입니다.");
  }, []);

  const addFavoriteMutation = useMutation({
    mutationFn: () => api.addFavorite(course.id),
    onSuccess: () => {
      getFavoriteQuery.refetch();
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: () => {
      return api.removeFavorite(course.id);
    },
    onSuccess: () => {
      getFavoriteQuery.refetch();
    },
  });

  const isFavoriteDisabled =
    addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

  const handleFavorite = useCallback(() => {
    if (user) {
      // toggle
      if (getFavoriteQuery.data?.data?.isFavorite) {
        removeFavoriteMutation.mutate();
      } else {
        addFavoriteMutation.mutate();
      }
    } else {
      alert("로그인 후 이용해주세요.");
    }
  }, [user, getFavoriteQuery, addFavoriteMutation, removeFavoriteMutation]);

  const enrollMutation = useMutation({
    mutationFn: () => api.enrollCourse(course.id),
    onSuccess: () => {
      setIsEnrolled(true);
      setShowEnrollSuccessDialog(true);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleEnroll = useCallback(() => {
    if (isEnrolled) {
      alert("이미 수강신청한 강의입니다. 수강 화면으로 이동해주세요.");
      return;
    }

    if (!user) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    if (course.price > 0) {
      alert("결제는 추후 구현 예정입니다. 무료 강의를 이용해주세요.");
      return;
    }

    enrollMutation.mutate();
  }, [course, user, enrollMutation, isEnrolled]);

  const handleStartLearning = () => {
    setShowEnrollSuccessDialog(false);
    router.push(`/courses/lecture?courseId=${course.id}`);
  };

  return (
    <>
      <aside className="lg:sticky lg:top-24 lg:self-start lg:block hidden">
        <div className="border rounded-md w-80">
          <div className="p-6 space-y-4">
            {/* 가격 */}
            <div>
              {course.price > 0 &&
                (course.discountPrice ? (
                  <>
                    <span className="text-2xl font-bold text-primary">
                      {course.discountPrice.toLocaleString()}원
                    </span>
                    <span className="ml-2 line-through text-muted-foreground">
                      {course.price.toLocaleString()}원
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">
                    {course.price.toLocaleString()}원
                  </span>
                ))}
              {course.price === 0 && (
                <span className="text-2xl font-bold">무료</span>
              )}
            </div>
            {isEnrolled ? (
              <button
                onClick={() => {
                  router.push(`/courses/lecture?courseId=${course.id}`);
                }}
                className={cn(
                  "cursor-pointer w-full py-2 px-4 rounded-md bg-primary text-white font-semibold"
                )}
              >
                학습으로 이동하기
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrollMutation.isPending}
                className={cn(
                  "cursor-pointer w-full py-2 px-4 rounded-md bg-primary text-white font-semibold",
                  enrollMutation.isPending && "cursor-not-allowed"
                )}
              >
                수강신청 하기
              </button>
            )}
            <button
              onClick={handleCart}
              className="cursor-pointer w-full py-2 px-4 rounded-md border font-medium"
            >
              바구니에 담기
            </button>
            <button
              onClick={handleFavorite}
              disabled={isFavoriteDisabled}
              className={cn(
                "cursor-pointer w-full py-2 px-4 rounded-md border font-medium flex items-center justify-center gap-2 transition-colors",
                getFavoriteQuery.data?.data?.isFavorite
                  ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                  : "hover:bg-gray-50",
                isFavoriteDisabled && "cursor-not-allowed"
              )}
            >
              <HeartIcon
                className={cn(
                  "size-4 transition-colors",
                  getFavoriteQuery.data?.data?.isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-gray-500",
                  isFavoriteDisabled && "cursor-not-allowed"
                )}
              />
              {getFavoriteQuery.data?.data?.favoriteCount ?? 0}
            </button>
          </div>
          {/* info section */}
          <div className="bg-[#F8F9FA] p-6 space-y-1 text-sm rounded-b-md">
            <p>
              <strong>지식공유자:</strong> {course.instructor.name}
            </p>
            <p>
              <strong>강의 수:</strong> {course.totalLectures}개
            </p>
            <p>
              <strong>강의 시간:</strong>{" "}
              {formatSecondsToHourMin(course.totalDuration)}
            </p>
            <p>
              <strong>난이도:</strong> {getLevelText(course.level)}
            </p>
          </div>
        </div>
      </aside>

      {/* 수강신청 완료 다이얼로그 */}
      <Dialog
        open={showEnrollSuccessDialog}
        onOpenChange={setShowEnrollSuccessDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>수강신청 완료</DialogTitle>
            <DialogDescription>
              수강신청이 완료되었어요. 강의실로 이동하여 바로 학습하시겠어요?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowEnrollSuccessDialog(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleStartLearning}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
            >
              바로 학습 시작
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function MobileBottomBar({ course }: { course: CourseDetailDto }) {
  const handleCart = () => {
    alert("장바구니 기능은 준비 중입니다.");
  };
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 border-t bg-white flex items-center gap-4 px-4 py-3 z-50 shadow">
      <div className="flex-1">
        {course.discountPrice ? (
          <>
            <span className="font-bold text-lg text-primary">
              {course.discountPrice.toLocaleString()}원
            </span>
            <span className="ml-2 line-through text-muted-foreground text-sm">
              {course.price.toLocaleString()}원
            </span>
          </>
        ) : (
          <span className="font-bold text-lg">
            {course.price.toLocaleString()}원
          </span>
        )}
      </div>
      <button className="flex-1 py-2 rounded-md bg-primary text-white font-semibold">
        수강신청
      </button>
      <button
        onClick={handleCart}
        className="p-2 rounded-md border font-medium"
        aria-label="장바구니에 담기"
      >
        <ShoppingCartIcon className="size-5" />
      </button>
    </div>
  );
}

/*****************
 * Main Component *
 *****************/
export default function CourseDetailUI({
  course,
  user,
}: {
  course: CourseDetailDto;
  user?: User;
}) {
  return (
    <div className="mx-auto px-4 pb-24 lg:pb-12">
      <Header course={course} />

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10">
        {/* Main content */}
        <div className="max-w-3xl">
          <Introduction course={course} />
          <InstructorBio instructor={course.instructor} />
          <Curriculum courseId={course.id} sections={course.sections} />
          <ReviewsSection courseId={course.id} user={user} />
        </div>

        {/* Floating menu */}
        <FloatingMenu user={user} course={course} />
      </div>

      {/* 모바일 하단 바 */}
      <MobileBottomBar course={course} />
    </div>
  );
}
