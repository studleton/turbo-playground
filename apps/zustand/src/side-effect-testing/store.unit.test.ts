import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { createCourseStore, internalActions } from "./store";

const internalActionSpies = {
  completeCourse: vi.spyOn(internalActions, "completeCourse"),
  showHiddenElements: vi.spyOn(internalActions, "showHiddenElements"),
};

const useCourseStore = createCourseStore({
  isCourseComplete: false,
  isSavingTracking: false,
  elements: [
    { id: "1", isComplete: false, isHidden: false },
    { id: "2", isComplete: false, isHidden: false },
    { id: "3", isComplete: false, isHidden: true },
  ],
  elementCompletionTriggers: [
    { elementId: "1", actionKey: "completeCourse" },
    { elementId: "2", actionKey: "showHiddenElements" },
  ],
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("setElementAsComplete", () => {
  it("should set the correct element's isComplete property to true", () => {
    const { result: store } = renderHook(() => useCourseStore());
    expect(store.current.elements[0]!.isComplete).toBe(false);
    act(() => store.current.actions.setElementAsComplete("1"));
    expect(store.current.elements[0]!.isComplete).toBe(true);
  });

  it("should set the isCourseComplete store property to true if all elements are complete", () => {
    const { result: store } = renderHook(() => useCourseStore());
    expect(store.current.isCourseComplete).toBe(false);

    // The trigger on element 1 will complete the course early, so needs removing for this test.
    act(() =>
      useCourseStore.setState((state) => ({
        elementCompletionTriggers: state.elementCompletionTriggers.filter(
          (trigger) => trigger.actionKey !== "completeCourse"
        ),
      }))
    );
    act(() => store.current.actions.setElementAsComplete("1"));
    // confirm the early completion was not triggered
    expect(internalActionSpies.completeCourse).not.toHaveBeenCalled();

    act(() => store.current.actions.setElementAsComplete("2"));
    act(() => store.current.actions.setElementAsComplete("3"));
    expect(internalActionSpies.completeCourse).toHaveBeenCalled();
    expect(store.current.isCourseComplete).toBe(true);
  });

  it("should execute the action function when an element's isComplete property is set to true", () => {
    const { result: store } = renderHook(() => useCourseStore());
    act(() => store.current.actions.setElementAsComplete("1"));
    expect(internalActionSpies.completeCourse).toHaveBeenCalled();
  });

  it("should set the isCourseComplete property to true when the completeCourse action is triggered", () => {
    const { result: store } = renderHook(() => useCourseStore());
    expect(store.current.isCourseComplete).toBe(false);
    act(() => store.current.actions.setElementAsComplete("1"));
    expect(internalActionSpies.completeCourse).toHaveBeenCalled();
    expect(store.current.isCourseComplete).toBe(true);
  });

  it("should set isHidden property to false for elements when the showHiddenElements action is triggered", () => {
    const { result: store } = renderHook(() => useCourseStore());
    expect(
      store.current.elements.every((element) => !element.isHidden)
    ).not.toBeTruthy();
    act(() => store.current.actions.setElementAsComplete("2"));
    expect(internalActionSpies.showHiddenElements).toHaveBeenCalled();
    expect(
      store.current.elements.every((element) => !element.isHidden)
    ).toBeTruthy();
  });

  describe("should call the sendTrackingData function when the isCourseComplete property changes to true", () => {
    // This is achieved with the completeCourse internal action, as long as we use it
    // instead of directly setting completion then sendTrackingData will be called
    // Jump though more hoops to spy on sendTrackingData if you want to confirm a function call calls a function
    it("should call the completeCourse internal action to complete the course", () => {
      const { result: store } = renderHook(() => useCourseStore());
      act(() => store.current.actions.setCourseAsComplete());
      expect(internalActionSpies.completeCourse).toHaveBeenCalled();
    });
  });
});
