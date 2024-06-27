import {
  create,
  type StateCreator,
  type StoreApi,
  type UseBoundStore,
} from "zustand";

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

type TriggerActions = Record<
  "completeCourse" | "showHiddenElements",
  (state: CourseState) => CourseState
>;
type CourseState = {
  isCourseComplete: boolean;
  isSavingTracking: boolean;
  elements: { id: string; isComplete: boolean; isHidden: boolean }[];
  elementCompletionTriggers: {
    elementId: string;
    actionKey: keyof TriggerActions;
  }[];
  triggerActions: TriggerActions;
  setElementAsComplete: (elementId: string) => void;
};

// type Action = "completeCourse" | "showHiddenElements";
// export type CourseState = {
//   triggers: {
//     elementId: string;
//     action: A extends string;
//   }[];
//   actions: Record<A, () => void>;
// };

// const course: CourseState = {
//   isCourseComplete: false,
//   isSavingTracking: false,
//   elements: [
//     { id: "1", isComplete: false, isHidden: false },
//     { id: "2", isComplete: false, isHidden: false },
//     { id: "3", isComplete: false, isHidden: true },
//   ],
//   triggers: [
//     { elementId: "1", action: "completeCourse" },
//     { elementId: "2", action: "showHiddenElements" },
//   ],
//   actions: {
//     completeCourse: () => {},
//     showHiddenElements: () => {},
//   },
// };

// export const useCourseStore = create<CourseState>()((set) => ({
//   isCourseComplete: false,
//   isSavingTracking: false,
//   elements: [
//     { id: "1", isComplete: false, isHidden: false },
//     { id: "2", isComplete: false, isHidden: false },
//     { id: "3", isComplete: false, isHidden: true },
//   ],
//   triggers: [
//     { elementId: "1", action: () => triggerActions.completeCourse(set) },
//     { elementId: "2", action: () => triggerActions.showHiddenElements(set) },
//   ],
//   setElementAsComplete: (elementId) =>
//     set((state) => ({
//       elements: state.elements.map((element) =>
//         element.id === elementId ? { ...element, isComplete: true } : element
//       ),
//     })),
// }));

// const triggerMiddleware = (config: StoreApi<CourseState>) => (set: SetStoreState) => (

export const createCourseStore = (
  initialiser: (set: SetStoreState) => Omit<CourseState, "setElementAsComplete">
) =>
  create<CourseState>()((set) => ({
    ...initialiser(set),
    setElementAsComplete: (elementId) =>
      set((state) => {
        let newState = { ...state };
        newState.elements = state.elements.map((element) =>
          element.id === elementId ? { ...element, isComplete: true } : element
        );

        if (newState.elements.every((element) => element.isComplete)) {
          newState.isCourseComplete = true;
        }

        newState.elementCompletionTriggers.forEach((trigger) => {
          if (trigger.elementId === elementId) {
            newState = state.triggerActions[trigger.actionKey](newState);
          }
        });

        return newState;
      }),
  }));
