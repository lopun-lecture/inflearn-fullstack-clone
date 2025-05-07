import { Metadata } from "next";
import UI from "./ui";
import * as api from "@/lib/api";

export const metadata: Metadata = {
  title: "계정 설정 - 인프런",
  description: "인프런 계정 설정 페이지입니다.",
};

export default async function AccountSettingsPage() {
  const profile = await api.getProfile();
  if (!profile.data || profile.error)
    return <div>프로필이 존재하지 않습니다.</div>;
  return <UI profile={profile.data} />;
}
