"use client";

import { usePathname, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const steps = [
  {
    section: "강의 제작",
    items: [
      {
        label: "강의 정보",
        href: (id: string) => `/course/${id}/edit/course_info`,
        description: undefined,
        key: "course_info",
      },
      {
        label: "커리큘럼",
        href: (id: string) => `/course/${id}/edit/curriculum`,
        description: undefined,
        key: "curriculum",
      },
      {
        label: "상세소개",
        href: (id: string) => `/course/${id}/edit/description-builder`,
        description: "200자 이상 작성",
        key: "description-builder",
      },
      {
        label: "커버 이미지",
        href: (id: string) => `/course/${id}/edit/cover-image`,
        description: undefined,
        key: "cover-image",
      },
    ],
  },
];

function getStepStatus(
  pathname: string,
  id: string,
  key: string,
  index: number
) {
  // 현재 경로가 해당 스텝이면 active, 이전이면 done, 이후면 default
  const allKeys = steps.flatMap((s) => s.items.map((i) => i.key));
  const currentIdx = allKeys.findIndex((k) => pathname.includes(k));
  if (currentIdx === -1) return "default";
  if (index === currentIdx) return "active";
  return "default";
}

export default function EditCourseSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  // id 추출 (예: /course/123/edit/course_info)
  const match = pathname.match(/course\/(.*?)\/edit/);
  const id = match ? match[1] : "";

  return (
    <Card className="w-60 p-6 flex flex-col gap-8 bg-white border-none rounded-lg shadow-none">
      {steps.map((section) => (
        <div key={section.section}>
          <div className="font-bold text-lg mb-4">{section.section}</div>
          <ol className="flex flex-col gap-2">
            {section.items.map((item, idx) => {
              const status = getStepStatus(pathname, id, item.key, idx);
              const isActive = status === "active";
              const stepNumber = idx;
              return (
                <li key={item.key} className="flex items-start gap-3">
                  <Link
                    href={item.href(id)}
                    className={`flex items-center gap-3 py-2 px-3 rounded-lg w-full transition-colors
                      ${
                        isActive
                          ? "bg-green-50 text-black font-bold border border-green-500"
                          : ""
                      }
                      ${!isActive ? "text-gray-400 hover:bg-gray-50" : ""}
                    `}
                  >
                    <span className="flex items-center justify-center w-7 h-7">
                      <span
                        className={`w-6 h-6 flex items-center justify-center rounded-full border
                            ${
                              isActive
                                ? "border-green-500 text-green-600"
                                : "border-gray-300 text-gray-400"
                            }
                          `}
                      >
                        {stepNumber}
                      </span>
                    </span>
                    <div className="flex flex-col">
                      <span>{item.label}</span>
                      {item.description && (
                        <span className="text-xs text-gray-400 mt-1">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </Card>
  );
}
