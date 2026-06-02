import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from "@/constants";

const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

const BASE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_ACCESS_TOKEN, accessToken, {
    ...BASE_OPTIONS,
    maxAge: ACCESS_MAX_AGE,
  });

  cookieStore.set(COOKIE_REFRESH_TOKEN, refreshToken, {
    ...BASE_OPTIONS,
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_ACCESS_TOKEN);
  cookieStore.delete(COOKIE_REFRESH_TOKEN);
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_REFRESH_TOKEN)?.value;
}
