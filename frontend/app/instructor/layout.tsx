import InstructorPageName from "./_components/instructor-page-name";
import InstructorSidebar from "./_components/instructor-sidebar";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      {/* 제목 */}
      <InstructorPageName />
      <div className="flex w-6xl mx-auto">
        <InstructorSidebar />
        {children}
      </div>
    </div>
  );
}
