import Autocomplete, { type AutocompleteChangeReason } from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import TextField, { type TextFieldProps } from "@mui/material/TextField";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";

/**
 * Debounce any changing value by `delay` ms.
 */
function useDebouncedValue<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

export type DefaultOptionValue = string | number;

/** Internal: state returned by the hook */
export interface UseAsyncAutocompleteState<T, V extends DefaultOptionValue> {
    options: T[];
    selectedOption: T | null;
    selectedValue: V | null;
    inputValue: string;
    open: boolean;
    isLoading: boolean;
    setOpen: (next: boolean) => void;
    setInputValue: (next: string) => void;
    setSelectedValue: (val: V | null) => void;
    setSelectedOption: (opt: T | null) => void;
}

/**
 * Hook params for async autocomplete.
 * Hydration strategy: use `initialValue` (resortCode) and call fetchOptions(String(value)),
 * then select the exact match by getOptionValue(option) === value.
 */
export interface UseAsyncAutocompleteParams<T, V extends DefaultOptionValue> {
    /** Fetch options for a search term; must return an array. */
    fetchOptions: (term: string) => Promise<T[]>;
    /** Extract the display label from an option. */
    getOptionLabel: (opt: T) => string;
    /** Extract the submitted value (e.g., resortCode) from an option. */
    getOptionValue: (opt: T) => V;

    /** Initial/controlled value for hydration (e.g., resortCode from advertisement). */
    initialValue?: V | null;

    /** Minimum characters before searching (default: 2). */
    minChars?: number;

    /** Debounce in ms for the search term (default: 300). */
    debounceMs?: number;

    /** React Query key base (separate caches for multiple instances). */
    queryKeyBase?: ReadonlyArray<string | number>;
}

/**
 * Encapsulates debounced search, React Query fetching, min-char gating,
 * and initial value rehydration via fetchOptions(String(value)).
 */
export function useAsyncAutocomplete<T, V extends DefaultOptionValue>(
    params: UseAsyncAutocompleteParams<T, V>
): UseAsyncAutocompleteState<T, V> {
    const {
        fetchOptions,
        getOptionLabel,
        getOptionValue,
        initialValue = null,
        minChars = 2,
        debounceMs = 300,
        queryKeyBase = ["async-autocomplete"],
    } = params;

    const qc = useQueryClient();

    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [selectedOption, setSelectedOption] = useState<T | null>(null);

    const selectedValue = useMemo<V | null>(
        () => (selectedOption ? getOptionValue(selectedOption) : null),
        [selectedOption, getOptionValue]
    );

    const debounced = useDebouncedValue(inputValue, debounceMs);
    const canSearch = open && debounced.trim().length >= minChars;

    // Normal debounced search (only when popup is open & min chars met)
    const {
        data: options = [],
        isFetching,
    } = useQuery({
        queryKey: [...queryKeyBase, "list", debounced],
        queryFn: () => fetchOptions(debounced),
        enabled: canSearch,
        staleTime: 30_000,
        gcTime: 5 * 60_000,
    });

    // ---- Hydration (runs once per distinct value) ----
    const hydrationKeyRef = React.useRef<V | null>(null);
    const needsHydration =
        selectedOption == null &&
        initialValue != null &&
        hydrationKeyRef.current !== initialValue;

    // Try cache-first resolve to avoid a network call
    function resolveFromCache(val: V): T | null {
        const cacheBuckets = qc.getQueryCache().findAll({ queryKey: [...queryKeyBase, "list"] });
        for (const q of cacheBuckets) {
            const data = q.state.data as T[] | undefined;
            if (Array.isArray(data)) {
                const hit = data.find((o) => getOptionValue(o) === val);
                if (hit) return hit;
            }
        }
        return null;
    }

    // Hydration query: use initialValue as the SEARCH TERM (supports resortCode search)
    const hydrationQuery = useQuery({
        queryKey: [...queryKeyBase, "hydrate", String(initialValue ?? "")],
        queryFn: async () => {
            const val = initialValue as V;
            const cached = resolveFromCache(val);
            if (cached) return { option: cached, list: null as T[] | null };

            const list = await fetchOptions(String(val));
            const hit = list.find((o) => getOptionValue(o) === val) ?? null;
            return { option: hit, list };
        },
        enabled: needsHydration,
        staleTime: 30_000,
        gcTime: 5 * 60_000,
    });

    // React Query v5: handle effects based on query state (no onSuccess)
    useEffect(() => {
        if (!needsHydration) return;

        if (hydrationQuery.status === "success") {
            const { option, list } = hydrationQuery.data!;
            if (option) {
                setSelectedOption(option);
                setInputValue(getOptionLabel(option));
                hydrationKeyRef.current = getOptionValue(option);
                // Optionally seed a list bucket to smooth subsequent opens
                if (Array.isArray(list)) {
                    qc.setQueryData([...queryKeyBase, "list", ""], (prev: unknown) => {
                        const arr = Array.isArray(prev) ? (prev as T[]) : [];
                        return arr.some((o) => getOptionValue(o) === getOptionValue(option))
                            ? arr
                            : [option, ...arr];
                    });
                }
            } else {
                // No match found; clear to prevent incorrect labels
                setSelectedOption(null);
                setInputValue("");
                hydrationKeyRef.current = initialValue as V;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hydrationQuery.status, hydrationQuery.data, needsHydration]);

    // Clearing input should not trigger fetches (minChars gating prevents it)
    useEffect(() => {
        if (inputValue.trim().length === 0) {
            setSelectedOption(null);
        }
    }, [inputValue]);

    return {
        options,
        selectedOption,
        selectedValue,
        inputValue,
        open,
        isLoading: isFetching || hydrationQuery.isFetching,
        setOpen,
        setInputValue,
        setSelectedValue: (val) => {
            // If externally changed, allow a new hydration cycle
            if (val !== hydrationKeyRef.current) {
                hydrationKeyRef.current = null;
            }
            if (val == null) {
                setSelectedOption(null);
                setInputValue("");
                return;
            }
            // Try cache immediate resolution
            const hit = resolveFromCache(val);
            if (hit) {
                setSelectedOption(hit);
                setInputValue(getOptionLabel(hit));
                hydrationKeyRef.current = val;
                return;
            }
            // Otherwise, hydration query will run due to needsHydration=true
        },
        setSelectedOption,
    };
}

/**
 * Public component props
 */
export interface AsyncAutocompleteSelectProps<T, V extends DefaultOptionValue> {
    /** Material UI label for the input. */
    label?: string;
    /** Placeholder text. */
    placeholder?: string;
    /** Disable the field. */
    disabled?: boolean;
    /** Full width input (default: true). */
    fullWidth?: boolean;
    /** Minimum characters before searching (default: 2). */
    minChars?: number;
    /** Debounce delay (ms) for search term (default: 300). */
    debounceMs?: number;
    /** React Query cache key base (to separate instances). */
    queryKeyBase?: ReadonlyArray<string | number>;

    /** Fetch options for a search term. */
    fetchOptions: (term: string) => Promise<T[]>;
    /** Extract the display label from an option. */
    getOptionLabel: (opt: T) => string;
    /** Extract the submitted value from an option (resortCode). */
    getOptionValue: (opt: T) => V;

    /** Controlled value (resortCode). If provided, component is controlled. */
    value?: V | null;
    /** Uncontrolled initial value (resortCode) for edit forms. */
    defaultValue?: V | null;
    /** Change handler: (value, option). */
    onChange?: (value: V | null, option: T | null) => void;

    /** Pass-through props to the underlying TextField. */
    textFieldProps?: Partial<TextFieldProps>;
}

/**
 * Reusable async autocomplete select (freeSolo=false).
 * - Debounced search (300ms), min-chars gating (default 2)
 * - React Query backed fetching
 * - Hydration via fetchOptions(String(value)) selecting exact match by getOptionValue
 * - Loading state integrated with MUI
 * - Flexible label/value mapping
 */
export function AsyncAutocompleteSelect<T, V extends DefaultOptionValue>(
    props: AsyncAutocompleteSelectProps<T, V>
) {
    const {
        label,
        placeholder,
        disabled,
        fullWidth = true,
        minChars = 2,
        debounceMs = 300,
        queryKeyBase = ["async-autocomplete"],

        fetchOptions,
        getOptionLabel,
        getOptionValue,

        value, // controlled
        defaultValue = null, // uncontrolled initial
        onChange,
        textFieldProps,
    } = props;

    const initialValue = (value !== undefined ? value : defaultValue) ?? null;

    const state = useAsyncAutocomplete<T, V>({
        fetchOptions,
        getOptionLabel,
        getOptionValue,
        initialValue: initialValue as V | null,
        minChars,
        debounceMs,
        queryKeyBase,
    });

    // Sync internal selection when controlled `value` changes
    useEffect(() => {
        if (value === undefined) return;
        state.setSelectedValue(value as V | null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
        <Autocomplete<T, false, false, false>
            freeSolo={false}
            open={state.open}
            onOpen={() => state.setOpen(true)}
            onClose={() => state.setOpen(false)}
            disabled={disabled}
            options={state.options}
            getOptionLabel={getOptionLabel}
            isOptionEqualToValue={(opt, val) => getOptionValue(opt) === getOptionValue(val)}
            loading={state.isLoading}
            inputValue={state.inputValue}
            onInputChange={(_, next, reason) => {
                // Ignore MUI's transient "reset" event on selection
                if (reason === "reset") return;
                state.setInputValue(next);
            }}
            value={state.selectedOption}
            onChange={(_, next: T | null, _reason: AutocompleteChangeReason) => {
                // Keep internal state synced immediately (avoid post-select hydration)
                state.setSelectedOption(next);
                const nextVal = next ? (getOptionValue(next) as V) : null;
                if (next) state.setInputValue(getOptionLabel(next));
                else state.setInputValue("");
                if (nextVal != null) state.setSelectedValue(nextVal);
                onChange?.(nextVal, next);
            }}
            filterOptions={(x) => x} // server filters
            noOptionsText={
                state.inputValue.trim().length < minChars
                    ? `Type at least ${minChars} characters…`
                    : "No matches"
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    fullWidth={fullWidth}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <InputAdornment position="end" sx={{ pr: 1 }}>
                                {state.isLoading ? <CircularProgress size={18} /> : null}
                                {params.InputProps.endAdornment}
                            </InputAdornment>
                        ),
                    }}
                    {...textFieldProps}
                />
            )}
        />
    );
}