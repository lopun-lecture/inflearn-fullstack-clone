"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  {
    label: "대시보드",
    href: "/instructor",
  },
  {
    label: "새 강의 만들기",
    href: "/create_courses",
  },
  {
    label: "강의 관리",
    href: "/instructor/courses",
  },
  {
    label: "미션 관리",
    href: "/instructor#",
  },
  {
    label: "멘토링 관리",
    href: "/instructor#",
  },
  {
    label: "강의 질문 관리",
    href: "/instructor#",
  },
  {
    label: "수강평 리스트",
    href: "/instructor#",
  },
  {
    label: "새소식 관리",
    href: "/instructor#",
  },
  {
    label: "수익 확인",
    href: "/instructor#",
  },
  {
    label: "쿠폰 관리",
    href: "/instructor#",
  },
];

export default function InstructorSidebar() {
  const pathname = usePathname();
  const [selectedTab, setSelectedTab] = useState("");

  const alertPreparing = () => {
    alert("준비중입니다.");
  };

  return (
    <aside className="w-full max-w-[260px] flex flex-col gap-2 p-4 border-r bg-white min-h-screen">
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href;
        const isPreparing = item.href.endsWith("#");
        return (
          <Button
            key={item.label}
            variant="link"
            className={`justify-start w-full text-base font-medium ${
              isActive ? "bg-white text-primary font-bold" : "text-gray-700"
            }`}
            onClick={isPreparing ? alertPreparing : undefined}
            asChild={!isPreparing}
          >
            {isPreparing ? (
              <span>{item.label}</span>
            ) : (
              <a href={item.href}>{item.label}</a>
            )}
          </Button>
        );
      })}
    </aside>
  );
}
