import { auth } from "@/auth";
import QuestionDetailPageUI from "./ui";
import { unauthorized } from "next/navigation";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await params;
  const session = await auth();

  if (!session?.user) {
    unauthorized();
  }

  return <QuestionDetailPageUI user={session.user} questionId={questionId} />;
}
