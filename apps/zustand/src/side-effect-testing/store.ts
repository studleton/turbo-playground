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

// Defined as a separate object for types and testing spies
export const triggerActions = {
  completeCourse: (state: CourseState) => {
    sendTrackingData(true);
    return {
      ...state,
      isCourseComplete: true,
    };
  },
  showHiddenElements: (state: CourseState) => ({
    ...state,
    elements: state.elements.map((element) => ({
      ...element,
      isHidden: false,
    })),
  }),
};
type TriggerActions = typeof triggerActions;

type CourseState = {
  isCourseComplete: boolean;
  isSavingTracking: boolean;
  elements: { id: string; isComplete: boolean; isHidden: boolean }[];
  elementCompletionTriggers: {
    elementId: string;
    actionKey: keyof TriggerActions;
  }[];
  triggerActions: TriggerActions;
  actions: {
    setElementAsComplete: (elementId: string) => void;
    setCourseAsComplete: () => void;
  };
};

export const createCourseStore = (
  initialData: Omit<CourseState, "actions" | "triggerActions">
) =>
  create<CourseState>()((set) => ({
    ...initialData,
    triggerActions,
    actions: {
      setElementAsComplete: (elementId) =>
        set((state) => {
          let newState = { ...state };
          newState.elements = state.elements.map((element) =>
            element.id === elementId
              ? { ...element, isComplete: true }
              : element
          );

          if (newState.elements.every((element) => element.isComplete)) {
            newState = newState.triggerActions.completeCourse(newState);
          }

          newState.elementCompletionTriggers.forEach((trigger) => {
            if (trigger.elementId === elementId) {
              newState = state.triggerActions[trigger.actionKey](newState);
            }
          });

          return newState;
        }),
      setCourseAsComplete: () =>
        set((state) => state.triggerActions.completeCourse(state)),
    },
  }));
