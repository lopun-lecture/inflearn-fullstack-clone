import * as api from "@/lib/api";
import UI from "./ui";
import { notFound } from "next/navigation";

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
