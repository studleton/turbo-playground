import { create } from "zustand";

const fakeFetch = async (url: string, options: RequestInit) =>
  new Promise<Response>((resolve) =>
    setTimeout(() => resolve(new Response()), 1000)
  );

const sendTrackingData = async (isComplete: boolean) => {
  const response = await fakeFetch("https://lms/tracking", {
    method: "POST",
    body: JSON.stringify({ isComplete }),
  });
  return response.json();
};

export const triggerActions = {
  completeCourse: () => {},
  showHiddenElements: () => {},
};

export type CourseState = {
  isCourseComplete: boolean;
  isSavingTracking: boolean;
  elements: { id: string; isComplete: boolean; isHidden: boolean }[];
  triggers: { elementId: string; action: () => void }[];
  setElementAsComplete: (elementId: string, isComplete: boolean) => void;
};

export const useCourseStore = create<CourseState>()((set) => ({
  isCourseComplete: false,
  isSavingTracking: false,
  elements: [
    { id: "1", isComplete: false, isHidden: false },
    { id: "2", isComplete: false, isHidden: false },
    { id: "3", isComplete: false, isHidden: true },
  ],
  triggers: [
    { elementId: "1", action: triggerActions.completeCourse },
    { elementId: "2", action: triggerActions.showHiddenElements },
  ],
  setElementAsComplete: (elementId, isComplete) =>
    set((state) => {
      return {};
    }),
}));

export const createCourseStore = (
  initialState: Omit<CourseState, "setElementAsComplete">
) =>
  create<CourseState>()((set) => ({
    ...initialState,
    setElementAsComplete: (elementId, isComplete) =>
      set((state) => {
        return {};
      }),
  }));
