"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "@/generated/openapi-client";
import { useMutation } from "@tanstack/react-query";
import * as api from "@/lib/api";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
};

const CKEditor = dynamic(() => import("@/components/ckeditor"), {
  ssr: false,
});

export default function UI({ profile }: { profile: User }) {
  const [image, setImage] = useState<string>(profile.image || "");
  const [name, setName] = useState(profile.name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [isUploading, setIsUploading] = useState(false);
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.updateProfile({
        name,
        bio,
        image,
      });
      if (error) {
        throw new Error(error as string);
      }

      return data;
    },
    onSuccess: () => {
      toast.success("프로필 업데이트가 완료되었습니다.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const uploadMediaResult = await api.uploadMedia(file);
      if (!uploadMediaResult.data || uploadMediaResult.error) {
        toast.error(uploadMediaResult.error as string);
        return;
      }
      setImage((uploadMediaResult.data as any).cloudFront.url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  });

  // 저장 버튼 클릭 시 (api 연동은 비워둠)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg mt-10 shadow">
      <h2 className="text-2xl font-bold mb-6">계정 설정</h2>
      <form onSubmit={handleSave} className="space-y-6">
        {/* 프로필 이미지 업로드 */}
        <div>
          <label className="block font-medium mb-2">프로필 이미지</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${
              isDragActive ? "border-primary" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            <div className="py-4 flex flex-col items-center">
              {isUploading ? (
                <Loader2 className="w-10 h-10 text-gray-400 animate-spin mb-2" />
              ) : image ? (
                <img
                  src={image}
                  alt="프로필 미리보기"
                  className="w-24 h-24 object-cover rounded-full mx-auto mb-2 border"
                />
              ) : (
                <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
              )}
              <span className="text-sm text-gray-600">
                {image
                  ? "클릭하여 변경"
                  : isDragActive
                  ? "이미지를 여기에 놓으세요"
                  : "클릭하거나 이미지를 드래그하여 업로드"}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            최대 5MB, jpg/png/gif 지원
          </p>
        </div>
        {/* 이름 */}
        <div>
          <label className="block font-medium mb-2">이름</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            required
          />
        </div>
        {/* 자기소개 */}
        <div>
          <label className="block font-medium mb-2">자기소개</label>
          <CKEditor value={bio} onChange={setBio} />
        </div>
        {/* 저장 버튼 */}
        <div className="pt-2">
          <Button
            disabled={updateProfileMutation.isPending}
            type="submit"
            className="w-full text-md font-bold"
            size={"lg"}
          >
            {updateProfileMutation.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <span>저장</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
