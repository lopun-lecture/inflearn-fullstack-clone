import { Metadata } from "next";
import UI from "./ui";

export const metadata: Metadata = {
  title: "회원가입 - 인프런",
  description: "인프런 회원가입 페이지입니다.",
};

export default function SignupPage() {
  return <UI />;
}
