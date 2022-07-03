import { createGlobalState } from "react-hooks-global-state";

const { setGlobalState, useGlobalState } = createGlobalState({
    authenticatedUser: null,
    userId: null,
});

export { useGlobalState, setGlobalState };
