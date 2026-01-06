import { useState, useCallback } from "react";

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

interface RateLimitState {
    requests: number[];
}

const getStorageKey = (key: string) => `rateLimit_${key}`;

const getState = (key: string): RateLimitState => {
    try {
        const stored = localStorage.getItem(getStorageKey(key));
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error reading rate limit state:", e);
    }
    return { requests: [] };
};

const setState = (key: string, state: RateLimitState) => {
    try {
        localStorage.setItem(getStorageKey(key), JSON.stringify(state));
    } catch (e) {
        console.error("Error saving rate limit state:", e);
    }
};

export function useRateLimit(key: string = "default") {
    const [isLimited, setIsLimited] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);

    const checkRateLimit = useCallback((): boolean => {
        const now = Date.now();
        const state = getState(key);

        // Filter out expired requests
        const validRequests = state.requests.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

        if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
            // Rate limited
            const oldestRequest = Math.min(...validRequests);
            const timeUntilReset = RATE_LIMIT_WINDOW_MS - (now - oldestRequest);
            setIsLimited(true);
            setRemainingTime(Math.ceil(timeUntilReset / 1000));

            // Set a timeout to clear the limited state
            setTimeout(() => {
                setIsLimited(false);
                setRemainingTime(0);
            }, timeUntilReset);

            return false;
        }

        // Add current request
        validRequests.push(now);
        setState(key, { requests: validRequests });

        setIsLimited(false);
        setRemainingTime(0);
        return true;
    }, [key]);

    const getRemainingRequests = useCallback((): number => {
        const now = Date.now();
        const state = getState(key);
        const validRequests = state.requests.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
        return Math.max(0, MAX_REQUESTS_PER_WINDOW - validRequests.length);
    }, [key]);

    const resetRateLimit = useCallback(() => {
        setState(key, { requests: [] });
        setIsLimited(false);
        setRemainingTime(0);
    }, [key]);

    return {
        checkRateLimit,
        isLimited,
        remainingTime,
        getRemainingRequests,
        resetRateLimit,
    };
}
