"use client";

import { Course } from "@/generated/openapi-client";
import * as api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
};

export default function UI({ course }: { course: Course }) {
  const queryClient = useQueryClient();
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    course.thumbnailUrl || ""
  );
  const updateCourseThumbnailMutation = useMutation({
    mutationFn: async (file: File) => {
      const { data, error } = await api.uploadMedia(file);
      if (!data || error) {
        toast.error(error as string);
        return;
      }

      setThumbnailUrl((data as any).cloudFront.url);

      return api.updateCourse(course.id, {
        thumbnailUrl: (data as any).cloudFront.url,
      });
    },
    onSuccess: () => {
      toast.success("커버 이미지 업데이트를 성공적으로 완료했습니다.");
      queryClient.invalidateQueries({
        queryKey: ["course", course.id],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        updateCourseThumbnailMutation.mutate(file);
      }
    },
    [updateCourseThumbnailMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <div className="space-y-4 prose bg-white p-8 rounded-lg">
      <h2>커버 이미지 업로드</h2>

      <div className="space-y-2">
        {/* 업로드 된 이미지 미리보기 */}
        {thumbnailUrl && (
          <div className="w-full h-auto min-h-[200px] relative rounded-lg overflow-hidden">
            <img
              src={thumbnailUrl}
              alt="커버 이미지"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 권장 이미지 형식 안내 */}
        <p className="text-sm text-gray-500 mb-2">
          • 최대 파일 크기: 5MB
          <br />
          • 지원 형식: .jpg, .jpeg, .png, .gif
          <br />• 권장 해상도: 1200 x 781px
        </p>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${
            isDragActive ? "border-primary" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          <div className="py-8">
            {updateCourseThumbnailMutation.isPending ? (
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
            ) : (
              <>
                <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {thumbnailUrl
                    ? "클릭하여 이미지 변경"
                    : isDragActive
                    ? "이미지를 여기에 놓아주세요"
                    : "클릭하거나 이미지를 드래그하여 업로드하세요"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
