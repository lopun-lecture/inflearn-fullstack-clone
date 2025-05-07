import * as api from "@/lib/api";
import UI from "./ui";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "강좌 편집 - 인프런",
  description: "인프런 강좌 편집 페이지입니다.",
};

export default async function EditCourseDescriptionBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await api.getCourseById(id);
  if (!course.data || course.error) {
    notFound();
  }

  return <UI course={course.data} />;
}
