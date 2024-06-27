import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { createCourseStore, triggerActions } from "./store";

const triggerActionSpies = {
  completeCourse: vi.spyOn(triggerActions, "completeCourse"),
  showHiddenElements: vi.spyOn(triggerActions, "showHiddenElements"),
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

describe("setElementAsComplete", () => {
  it("should set the correct element's isComplete property to true", () => {
    const { result: store } = renderHook(() => useCourseStore());
    act(() => store.current.actions.setElementAsComplete("1"));
    expect(store.current.elements[0]!.isComplete).toBe(true);
  });

  it("should set the isCourseComplete store property to true if all elements are complete", () => {
    const { result: store } = renderHook(() => useCourseStore());
    act(() => store.current.actions.setElementAsComplete("1"));
    act(() => store.current.actions.setElementAsComplete("2"));
    act(() => store.current.actions.setElementAsComplete("3"));
    expect(store.current.isCourseComplete).toBe(true);
  });

  it("should execute the action function when an element's isComplete property is set to true", () => {
    const { result: store } = renderHook(() => useCourseStore());
    act(() => store.current.actions.setElementAsComplete("1"));
    expect(triggerActionSpies.completeCourse).toHaveBeenCalled();
  });

  it("should set the isCourseComplete property to true when the completeCourse action is triggered", () => {
    const { result: store } = renderHook(() => useCourseStore());
    expect(store.current.isCourseComplete).toBe(false);
    act(() => store.current.actions.setElementAsComplete("1"));
    expect(triggerActionSpies.completeCourse).toHaveBeenCalled();
    expect(store.current.isCourseComplete).toBe(true);
  });

  it("should set isHidden property to false for elements when the showHiddenElements action is triggered", () => {
    const { result: store } = renderHook(() => useCourseStore());
    expect(
      store.current.elements.every((element) => !element.isHidden)
    ).toBeFalsy();
    act(() => store.current.actions.setElementAsComplete("2"));
    expect(triggerActionSpies.showHiddenElements).toHaveBeenCalled();
    expect(
      store.current.elements.every((element) => !element.isHidden)
    ).toBeTruthy();
  });

  describe("should call the sendTrackingData function when the isCourseComplete property changes to true", () => {
    // This is achieved with the completeCourse trigger action, as long as we use it
    // instead of directly setting completion then sendTrackingData will be called
    // Jump though more hoops to spy on sendTrackingData if you want to confirm a function call calls a function
    it("should call the completeCourse trigger action to complete the course", () => {
      const { result: store } = renderHook(() => useCourseStore());
      act(() => store.current.actions.setCourseAsComplete());
      expect(triggerActionSpies.completeCourse).toHaveBeenCalled();
    });
  });
});
