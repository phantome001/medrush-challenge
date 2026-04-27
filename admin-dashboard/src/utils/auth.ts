export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: "SUPER_ADMIN" | "INSTITUTION_ADMIN" | "TEACHER" | "STUDENT";
}

export const saveSession = (session: { accessToken: string; refreshToken: string; user: AdminUser }) => {
  localStorage.setItem("accessToken", session.accessToken);
  localStorage.setItem("refreshToken", session.refreshToken);
  localStorage.setItem("user", JSON.stringify(session.user));
};

export const getUser = (): AdminUser | null => {
  const value = localStorage.getItem("user");
  return value ? (JSON.parse(value) as AdminUser) : null;
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const isAuthenticated = () => Boolean(localStorage.getItem("accessToken"));
