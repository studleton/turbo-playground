import { act, renderHook } from "@testing-library/react";
import { create } from "zustand";
import { describe, expect, it } from "vitest";

interface UseIncrementingStoreType {
  value: number;
  increment: () => void;
}

const useIncrementingStore = create<UseIncrementingStoreType>()((set) => ({
  value: 0,
  increment: () => set((state) => ({ value: state.value + 1 })),
}));

describe("useIncrementingStore", () => {
  it("value's initial value is 0", () => {
    const { result } = renderHook(() => useIncrementingStore());
    expect(result.current.value).toEqual(0);
  });

  it("every time increment is called, value increases by one", () => {
    const { result } = renderHook(() => useIncrementingStore());
    expect(result.current.value).toEqual(0);

    act(() => result.current.increment());
    expect(result.current.value).toEqual(1);
    act(() => result.current.increment());
    expect(result.current.value).toEqual(2);
  });
});
