import { Convert } from "../types";

export default <T, S>(
    action: (state: Convert<T>) => S,
) => ({
    action,
    sustand_internal_iscomputed: true,
});
