import * as api from "@/lib/api";
import { notFound } from "next/navigation";
import UI from "./ui";
import { auth } from "@/auth";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const course = await api.getCourseById(id);

  if (!course.data || course.error) {
    notFound();
  }

  return <UI user={session?.user} course={course.data} />;
}
