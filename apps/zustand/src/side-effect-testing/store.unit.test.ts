import { describe, it, expect, assert, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { createCourseStore, triggerActions } from "./store";

const mockTriggerActions = {
  completeCourse: vi.fn(triggerActions.completeCourse),
  showHiddenElements: vi.fn(triggerActions.showHiddenElements),
};
const useCourseStore = createCourseStore((set) => ({
  isCourseComplete: false,
  isSavingTracking: false,
  elements: [
    { id: "1", isComplete: false, isHidden: false },
    { id: "2", isComplete: false, isHidden: false },
    { id: "3", isComplete: false, isHidden: true },
  ],
  triggers: [
    { elementId: "1", action: () => mockTriggerActions.completeCourse(set) },
    {
      elementId: "2",
      action: () => mockTriggerActions.showHiddenElements(set),
    },
  ],
}));

describe("setElementAsComplete", () => {
  it("should set the correct element's isComplete property to true", () => {
    const { result: store } = renderHook(() => useCourseStore());
    act(() => store.current.setElementAsComplete("1"));
    expect(store.current.elements[0]!.isComplete).toBe(true);
  });

  it("should set the isCourseComplete store property to true if all elements are complete", () => {
    const { result: store } = renderHook(() => useCourseStore());
    act(() => store.current.setElementAsComplete("1"));
    act(() => store.current.setElementAsComplete("2"));
    act(() => store.current.setElementAsComplete("3"));
    expect(store.current.isCourseComplete).toBe(true);
  });

  it("should execute the action function when an element's isComplete property is set to true", () => {
    const { result: store } = renderHook(() => useCourseStore());
    act(() => store.current.setElementAsComplete("1"));
    expect(mockTriggerActions.completeCourse).toHaveBeenCalled();
  });

  it("should set the isCourseComplete property to true when the completeCourse action is triggered", () => {
    const { result: store } = renderHook(() => useCourseStore());
    act(() => store.current.setElementAsComplete("1"));
    expect(mockTriggerActions.completeCourse).toHaveBeenCalled();
    expect(store.current.isCourseComplete).toBe(true);
  });

  it("should set isHidden property to false for elements when the showHiddenElements action is triggered", () => {
    const { result: store } = renderHook(() => useCourseStore());
    act(() => store.current.setElementAsComplete("2"));
    expect(mockTriggerActions.showHiddenElements).toHaveBeenCalled();
    expect(store.current.elements[0]!.isHidden).toBeFalsy();
    expect(store.current.elements[1]!.isHidden).toBeFalsy();
    expect(store.current.elements[2]!.isHidden).toBeFalsy();
  });

  // it("should call the sendTrackingData function when the isCourseComplete property changes to true", () => {
  //   const { result: store } = renderHook(() => useCourseStore());
  //   store.current.isCourseComplete = true;
  //   // Mock the sendTrackingData function and assert that it is called
  //   expect(false).toBe(true);
  // });
});
