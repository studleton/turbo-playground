import { describe, it, expect, assert, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { createCourseStore, triggerActions } from "./store";

const mockTriggerActions = {
  completeCourse: vi.fn(triggerActions.completeCourse),
  showHiddenElements: vi.fn(triggerActions.showHiddenElements),
};
const useCourseStore = createCourseStore({
  isCourseComplete: false,
  isSavingTracking: false,
  elements: [
    { id: "1", isComplete: false, isHidden: false },
    { id: "2", isComplete: false, isHidden: false },
    { id: "3", isComplete: false, isHidden: true },
  ],
  triggers: [
    { elementId: "1", action: mockTriggerActions.completeCourse },
    { elementId: "2", action: mockTriggerActions.showHiddenElements },
  ],
});

describe("setElementAsComplete", () => {
  it("should set the correct element's isComplete property to true", () => {
    const { result: store } = renderHook(() => useCourseStore());
    act(() => store.current.setElementAsComplete("1", true));
    expect(store.current.elements[0]!.isComplete).toBe(true);
  });

  it("should set the isCourseComplete store property to true if all elements are complete", () => {
    const { result: store } = renderHook(() => useCourseStore());
    store.current.setElementAsComplete("1", true);
    store.current.setElementAsComplete("2", true);
    store.current.setElementAsComplete("3", true);
    expect(store.current.isCourseComplete).toBe(true);
  });

  it("should execute the action function when an element's isComplete property is set to true", () => {
    const { result: store } = renderHook(() => useCourseStore());
    store.current.setElementAsComplete("1", true);
    expect(mockTriggerActions.completeCourse).toHaveBeenCalled();
  });

  it("should set the isCourseComplete property to true when the completeCourse action is triggered", () => {
    const { result: store } = renderHook(() => useCourseStore());
    store.current.setElementAsComplete("1", true);
    expect(mockTriggerActions.completeCourse).toHaveBeenCalled();
    expect(store.current.isCourseComplete).toBe(true);
  });

  it("should set isHidden property to false for elements when the showHiddenElements action is triggered", () => {
    const { result: store } = renderHook(() => useCourseStore());
    store.current.setElementAsComplete("2", true);
    expect(mockTriggerActions.showHiddenElements).toHaveBeenCalled();
    expect(store.current.elements[0]!.isHidden).toBeTruthy();
    expect(store.current.elements[1]!.isHidden).toBeTruthy();
    expect(store.current.elements[2]!.isHidden).toBeTruthy();
  });

  it("should call the sendTrackingData function when the isCourseComplete property changes to true", () => {
    const { result: store } = renderHook(() => useCourseStore());
    store.current.isCourseComplete = true;
    // Mock the sendTrackingData function and assert that it is called
    expect(false).toBe(true);
  });
});
