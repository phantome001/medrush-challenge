import { Response } from "express";
import { AuthenticatedRequest } from "../models/authenticatedRequest";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/errors";
import * as authService from "../services/authService";

export const register = asyncHandler(async (req, res) => {
  res.status(201).json(await authService.registerStudent(req.body));
});

export const login = asyncHandler(async (req, res) => {
  res.json(await authService.login(req.body));
});

export const refresh = asyncHandler(async (req, res) => {
  if (!req.body.refreshToken) throw new AppError(400, "Refresh token is required");
  res.json(await authService.refresh(req.body.refreshToken));
});

export const logout = asyncHandler(async (req, res) => {
  if (req.body.refreshToken) await authService.logout(req.body.refreshToken);
  res.status(204).send();
});

export const forgotPassword = asyncHandler(async (_req, res) => {
  res.json({ message: "If the email exists, a reset link will be sent by the configured email provider." });
});

export const resetPassword = asyncHandler(async (_req, res) => {
  res.json({ message: "Password reset endpoint is payment/email-provider ready." });
});

export const me = asyncHandler(async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  res.json({ user: authReq.user });
});
