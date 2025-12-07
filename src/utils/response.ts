import { Response } from "express";

interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message: string;
  data?: T;
}

export const successResponse = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    status: "success",
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500
): Response => {
  const response: ApiResponse = {
    status: "error",
    message,
  };
  return res.status(statusCode).json(response);
};

export const createdResponse = <T>(
  res: Response,
  message: string,
  data?: T
): Response => {
  return successResponse(res, message, data, 201);
};
