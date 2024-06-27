import { create, type StoreApi, type UseBoundStore } from "zustand";

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

type SetStoreState = (
  selector: (state: CourseState) => Partial<CourseState>
) => void;

export const triggerActions = {
  completeCourse: (set: SetStoreState) =>
    set((state) => ({ isCourseComplete: true })),
  showHiddenElements: (set: SetStoreState) =>
    set((state) => ({
      elements: state.elements.map((element) => ({
        ...element,
        isHidden: false,
      })),
    })),
};

export type CourseState = {
  isCourseComplete: boolean;
  isSavingTracking: boolean;
  elements: { id: string; isComplete: boolean; isHidden: boolean }[];
  triggers: {
    elementId: string;
    action: () => void;
  }[];
  setElementAsComplete: (elementId: string) => void;
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
    { elementId: "1", action: () => triggerActions.completeCourse(set) },
    { elementId: "2", action: () => triggerActions.showHiddenElements(set) },
  ],
  setElementAsComplete: (elementId) =>
    set((state) => ({
      elements: state.elements.map((element) =>
        element.id === elementId ? { ...element, isComplete: true } : element
      ),
    })),
}));

export const createCourseStore = (
  initialiser: (set: SetStoreState) => Omit<CourseState, "setElementAsComplete">
) =>
  create<CourseState>()((set) => ({
    ...initialiser(set),
    setElementAsComplete: (elementId) =>
      set((state) => {
        const elements = state.elements.map((element) =>
          element.id === elementId ? { ...element, isComplete: true } : element
        );

        if (elements.every((element) => element.isComplete)) {
          set(() => ({ isCourseComplete: true }));
        }

        state.triggers.forEach((trigger) => {
          if (trigger.elementId === elementId) {
            trigger.action();
          }
        });

        return { elements };
      }),
  }));
