import { Metadata } from "next";
import UI from "./ui";

export const metadata: Metadata = {
  title: "로그인 - 인프런",
  description: "인프런 로그인 페이지입니다.",
};

export default function SigninPage() {
  return <UI />;
}
