"use client";

import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDropzone } from "react-dropzone";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { FileVideo } from "lucide-react";
import * as api from "@/lib/api";
import { toast } from "sonner";
import { Lecture } from "@/generated/openapi-client";
import dynamic from "next/dynamic";

interface EditLectureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lecture: Lecture;
}

interface EditLectureForm {
  title: string;
  description: string;
  videoStorageInfo?: any;
}

const MAX_FILE_SIZE = 300 * 1024 * 1024; // 300MB
const ACCEPTED_VIDEO_TYPES = {
  "video/mp4": [".mp4"],
  "video/x-matroska": [".mkv"],
  "video/x-m4v": [".m4v"],
  "video/quicktime": [".mov"],
};

const CKEditor = dynamic(() => import("@/components/ckeditor"), {
  ssr: false,
});

export function EditLectureDialog({
  isOpen,
  onClose,
  lecture,
}: EditLectureDialogProps) {
  const queryClient = useQueryClient();

  console.log(`lecture: ${JSON.stringify(lecture)}`);
  const [form, setForm] = useState<EditLectureForm>({
    title: lecture.title,
    description: lecture.description ?? "<p>강의의 설명을 적어주세요.</p>",
    videoStorageInfo: lecture.videoStorageInfo,
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const { data, error } = await api.uploadMedia(file);
      if (!data || error) {
        toast.error(error as string);
        return;
      }
      setForm((prev) => ({ ...prev, videoStorageInfo: data }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_VIDEO_TYPES,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  });

  const editLectureMutation = useMutation({
    mutationFn: async (data: EditLectureForm) => {
      return api.updateLecture(lecture.id, {
        ...form,
      });
    },
    onSuccess: () => {
      toast.success("강의가 수정되었습니다.");
      queryClient.invalidateQueries({
        queryKey: ["course", lecture.courseId],
      });
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    editLectureMutation.mutate(form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>강의 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>강의 영상</Label>
            {/* 업로드 된 강의 미리보기 */}
            {form.videoStorageInfo && (
              <div className="w-full h-auto min-h-[200px]">
                <video
                  autoPlay={true}
                  controls={true}
                  src={form.videoStorageInfo.cloudFront.url}
                />
              </div>
            )}

            {/* 권장 영상 형식 안내 */}
            <p className="text-sm text-gray-500 mb-2">
              • 최대 파일 크기: 5GB
              <br />
              • 지원 형식: .mp4, .mkv, .m4v, .mov
              <br />• 최소 해상도: 1080p 이상 (권장)
            </p>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${
                isDragActive ? "border-primary" : "border-gray-300"
              }`}
            >
              <input {...getInputProps()} />
              <div className="py-8">
                <FileVideo className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {form.videoStorageInfo
                    ? `선택된 파일: ${form.videoStorageInfo.fileName}`
                    : isDragActive
                    ? "파일을 여기에 놓아주세요"
                    : "클릭하거나 파일을 드래그하여 업로드하세요"}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">수업 노트</Label>
            <CKEditor
              value={form.description}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, description: value }))
              }
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={editLectureMutation.isPending}>
              {editLectureMutation.isPending ? "수정 중..." : "수정"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
