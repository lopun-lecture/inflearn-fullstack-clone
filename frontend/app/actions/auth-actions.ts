"use server";

import { saltAndHashPassword } from "@/lib/password-utils";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";

export async function signUp({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return { status: "error", message: "이미 존재하는 이메일입니다." };
    }

    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword: saltAndHashPassword(password),
      },
    });

    if (user) {
      return { status: "ok" };
    }
  } catch (err) {
    console.error(err);
    return { status: "error", message: "회원가입에 실패했습니다." };
  }
}
