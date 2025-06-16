import * as api from "@/lib/api";
import UI from "./ui";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

export default async function LecturePage({
  searchParams,
}: {
  searchParams: Promise<{
    courseId: string;
    lectureId?: string;
  }>;
}) {
  const session = await auth();
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
      lectureActivities={lectureActivities.data ?? []}
      user={session?.user}
    />
  );
}
