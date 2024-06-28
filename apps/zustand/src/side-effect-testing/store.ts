import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

const fakeFetch = async (url: string, options: RequestInit) =>
  new Promise<Response>((resolve) =>
    setTimeout(() => resolve(new Response()), 1000)
  );

export const tracking = {
  sendTrackingData: async (isComplete: boolean) => {
    const response = await fakeFetch("https://lms/tracking", {
      method: "POST",
      body: JSON.stringify({ isComplete }),
    });
    return response.json();
  },
};

// Defined as a separate object for types and testing spies
export const internalActions = {
  completeCourse: (state: CourseState) => ({
    ...state,
    isCourseComplete: true,
  }),
  showHiddenElements: (state: CourseState) => ({
    ...state,
    elements: state.elements.map((element) => ({
      ...element,
      isHidden: false,
    })),
  }),
};
type InternalActions = typeof internalActions;

type CourseState = {
  isCourseComplete: boolean;
  isSavingTracking: boolean;
  elements: { id: string; isComplete: boolean; isHidden: boolean }[];
  elementCompletionTriggers: {
    elementId: string;
    actionKey: keyof InternalActions;
  }[];
  internalActions: InternalActions;
  actions: {
    setElementAsComplete: (elementId: string) => void;
    setCourseAsComplete: () => void;
  };
};

export const createCourseStore = (
  initialData: Omit<CourseState, "actions" | "internalActions">
) => {
  const store = create<CourseState>()(
    subscribeWithSelector((set) => ({
      ...initialData,
      internalActions,
      actions: {
        setElementAsComplete: (elementId) =>
          set((state) => {
            let newState = { ...state };

            // complete element
            newState.elements = state.elements.map((element) =>
              element.id === elementId
                ? { ...element, isComplete: true }
                : element
            );

            // complete course if all elements are complete
            if (newState.elements.every((element) => element.isComplete)) {
              newState = newState.internalActions.completeCourse(newState);
            }

            // handle element completion triggers
            newState.elementCompletionTriggers.forEach((trigger) => {
              if (trigger.elementId === elementId) {
                newState = state.internalActions[trigger.actionKey](newState);
              }
            });

            return newState;
          }),
        setCourseAsComplete: () =>
          set((state) => state.internalActions.completeCourse(state)),
      },
    }))
  );
  store.subscribe(
    (state) => state.isCourseComplete,
    (isCourseComplete) => tracking.sendTrackingData(isCourseComplete)
  );
  return store;
};
