import CourseList from "@/components/course-list";

export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page_number?: string }>;
}) => {
  const { q, page_number } = await searchParams;

  return {
    title: `인프런 - ${q} 검색 결과`,
    description: `인프런에서 ${q} 검색 결과를 찾아보세요.`,
  };
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page_number?: string }>;
}) {
  const { q, page_number } = await searchParams;

  return (
    <div className="p-6">
      <CourseList q={q || ""} page={page_number ? parseInt(page_number) : 1} />
    </div>
  );
}
