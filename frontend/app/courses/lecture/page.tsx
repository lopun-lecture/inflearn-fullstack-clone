import * as api from "@/lib/api";
import UI from "./ui";
import { notFound } from "next/navigation";

export default async function LecturePage({
  searchParams,
}: {
  searchParams: Promise<{
    courseId: string;
    lectureId?: string;
  }>;
}) {
  const { courseId, lectureId } = await searchParams;
  const course = await api.getCourseById(courseId);
  const lectureActivities = await api.getAllLectureActivities(courseId);

  if (!course.data || course.error) {
    notFound();
  }

  return (
    <UI
      course={course.data}
      lectureId={lectureId}
      lectureActivities={lectureActivities.data}
    />
  );
}
