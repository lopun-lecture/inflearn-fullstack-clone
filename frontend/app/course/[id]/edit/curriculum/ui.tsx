"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Trash2, Lock, LockOpen, Plus, Edit } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Course,
  Section,
  Lecture,
  CourseCategory,
  LectureActivity,
} from "@/generated/openapi-client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import * as api from "@/lib/api";
import { notFound } from "next/navigation";
import { toast } from "sonner";

export default function UI({ initialCourse }: { initialCourse: Course }) {
  const queryClient = useQueryClient();

  // 강의 추가 Dialog 상태
  const [addLectureSectionId, setAddLectureSectionId] = useState<string | null>(
    null
  );
  const [addLectureTitle, setAddLectureTitle] = useState("");
  const [lectureDialogOpen, setLectureDialogOpen] = useState(false);
  // 섹션 추가 상태
  const [addSectionTitle, setAddSectionTitle] = useState("");
  // 섹션별 임시 제목 상태
  const [sectionTitles, setSectionTitles] = useState<Record<string, string>>(
    {}
  );

  // 코스 데이터 조회
  const { data: course } = useQuery<Course>({
    queryKey: ["course", initialCourse.id],
    queryFn: async () => {
      // TODO: 실제 API 호출로 대체
      const { data } = await api.getCourseById(initialCourse.id);
      if (!data) {
        notFound();
      }

      return data;
    },
  });

  // 섹션 추가
  const addSectionMutation = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await api.createSection(initialCourse.id, title);

      if (error) {
        toast.error(error as string);
        return null;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", initialCourse.id] });
      toast.success("섹션이 생성되었습니다.");
    },
  });

  // 섹션 삭제
  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      const { data, error } = await api.deleteSection(sectionId);

      if (error) {
        toast.error(error as string);
        return null;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", initialCourse.id] });
      toast.success("섹션이 삭제되었습니다.");
    },
  });

  // 강의 추가
  const addLectureMutation = useMutation({
    mutationFn: async ({
      sectionId,
      title,
    }: {
      sectionId: string;
      title: string;
    }) => {
      const { data, error } = await api.createLecture(sectionId, title);

      if (error) {
        toast.error(error as string);
        return null;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", initialCourse.id] });
      toast.success("강의가 생성되었습니다.");
    },
  });

  // 강의 삭제
  const deleteLectureMutation = useMutation({
    mutationFn: async ({ lectureId }: { lectureId: string }) => {
      const { data, error } = await api.deleteLecture(lectureId);

      if (error) {
        toast.error(error as string);
        return null;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", initialCourse.id] });
      toast.success("강의가 삭제되었습니다.");
    },
  });

  // 섹션 제목 수정 mutation
  const updateSectionTitleMutation = useMutation({
    mutationFn: async ({
      sectionId,
      title,
    }: {
      sectionId: string;
      title: string;
    }) => {
      const { data, error } = await api.updateSectionTitle(sectionId, title);

      if (error) {
        toast.error(error as string);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", initialCourse.id] });
      toast.success("섹션 제목이 수정되었습니다.");
    },
  });

  // UI 핸들러
  const handleAddSection = () => {
    // '섹션 제목을 작성해주세요'로 바로 생성
    addSectionMutation.mutate("섹션 제목을 작성해주세요");
    setAddSectionTitle("");
  };

  const handleDeleteSection = (sectionId: string) => {
    deleteSectionMutation.mutate(sectionId);
  };

  const openLectureDialog = (sectionId: string) => {
    setAddLectureSectionId(sectionId);
    setAddLectureTitle("");
    setLectureDialogOpen(true);
  };

  const handleAddLecture = () => {
    if (!addLectureTitle.trim() || !addLectureSectionId) return;
    addLectureMutation.mutate({
      sectionId: addLectureSectionId,
      title: addLectureTitle,
    });
    setLectureDialogOpen(false);
    setAddLectureTitle("");
    setAddLectureSectionId(null);
  };

  const toggleLecturePreviewMutation = useMutation({
    mutationFn: async (lecture: Lecture) => {
      const { data, error } = await api.updateLecturePreview(
        lecture.id,
        !lecture.isPreview
      );
      console.log(data, error);
      if (error) {
        toast.error(error as string);
        return null;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course", initialCourse.id],
      });
    },
  });

  const handleToggleLecturePreview = (lecture: Lecture) => {
    toggleLecturePreviewMutation.mutate(lecture);
  };

  const handleDeleteLecture = (lectureId: string) => {
    deleteLectureMutation.mutate({ lectureId });
  };

  // 강의 미리보기 토글, 섹션 공개/비공개 토글 등은 TODO: mutation 추가 필요

  if (!course) return <div>코스 정보를 불러올 수 없습니다.</div>;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1 className="text-2xl font-bold">커리큘럼</h1>
          </CardTitle>
        </CardHeader>
      </Card>

      {course.sections?.map((section: Section, sectionIdx: number) => (
        <div key={section.id} className="border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-semibold">
                섹션 {sectionIdx + 1}
              </span>
              <Input
                className="w-64"
                value={sectionTitles[section.id] ?? section.title}
                onChange={(e) => {
                  setSectionTitles((prev) => ({
                    ...prev,
                    [section.id]: e.target.value,
                  }));
                }}
                onBlur={(e) => {
                  const newTitle = e.target.value.trim();
                  if (newTitle && newTitle !== section.title) {
                    updateSectionTitleMutation.mutate({
                      sectionId: section.id,
                      title: newTitle,
                    });
                  }
                }}
                placeholder="섹션 제목을 입력하세요."
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteSection(section.id)}
                className="text-red-500 hover:bg-red-100"
                aria-label="섹션 삭제"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            {section.lectures?.map((lecture: Lecture, lectureIdx: number) => (
              <div
                key={lecture.id}
                className="flex items-center justify-between px-2 py-2 border rounded-md bg-white"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 w-5 text-center">
                    {lectureIdx + 1}
                  </span>
                  <span className="font-medium">{lecture.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      handleToggleLecturePreview(lecture);
                    }}
                    aria-label="미리보기 토글"
                  >
                    {lecture.isPreview ? (
                      <LockOpen className="text-green-600" size={18} />
                    ) : (
                      <Lock className="text-gray-400" size={18} />
                    )}
                  </Button>
                  {/* 수정 버튼 추가 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      /* TODO: 강의 수정 모달 오픈 */
                    }}
                    aria-label="강의 수정"
                  >
                    <Edit size={18} className="text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteLecture(lecture.id)}
                    className="text-red-500 hover:bg-red-100"
                    aria-label="강의 삭제"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openLectureDialog(section.id)}
            >
              <Plus size={16} className="mr-1" /> 수업 추가
            </Button>
          </div>
        </div>
      ))}
      {/* 섹션 추가 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-green-600 font-semibold">섹션 추가</span>
          <Input
            className="w-64"
            value={addSectionTitle}
            onChange={(e) => setAddSectionTitle(e.target.value)}
            placeholder="섹션 제목을 작성해주세요. (최대 200자)"
            maxLength={200}
          />
          <Button onClick={handleAddSection} variant="default" size="sm">
            추가
          </Button>
        </div>
      </div>

      {/* 강의 추가 Dialog */}
      <Dialog open={lectureDialogOpen} onOpenChange={setLectureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>수업 추가</DialogTitle>
          </DialogHeader>
          <Input
            value={addLectureTitle}
            onChange={(e) => setAddLectureTitle(e.target.value)}
            placeholder="제목을 입력해주세요. (최대 200자)"
            maxLength={200}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLectureDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleAddLecture} variant="default">
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
