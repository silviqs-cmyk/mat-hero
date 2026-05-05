import { dayOneData } from "@/data/dayOne";
import type { ApiResponse, CourseDayScreenData } from "@/types";

export async function getCourseDayById(dayId: string): Promise<ApiResponse<CourseDayScreenData>> {
  if (dayId === "day_1") {
    return {
      data: dayOneData,
      error: null,
    };
  }

  return {
    data: dayOneData,
    error: `No mocked course day found for ${dayId}. Falling back to day_1.`,
  };
}
