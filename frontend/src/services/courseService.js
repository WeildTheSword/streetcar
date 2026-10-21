import { HttpError, request } from "./httpClient";

export async function fetchCourses() {
  try {
    return await request("/courses");
  } catch (error) {
    if (error instanceof HttpError) {
      throw new Error("Failed to fetch courses");
    }
    throw error;
  }
}
