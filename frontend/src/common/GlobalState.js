import { createGlobalState } from "react-hooks-global-state";

const { setGlobalState, useGlobalState } = createGlobalState({
    authenticatedUser: null,
});

export { useGlobalState, setGlobalState };