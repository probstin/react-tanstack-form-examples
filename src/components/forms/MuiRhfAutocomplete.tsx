import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useDebounce } from 'use-debounce';

export interface AsyncAutocompleteProps<T> {
    name: string;
    label: string;
    fetchOptions: (input: string) => Promise<T[]>;
    getOptionLabel: (option: T) => string;
    getOptionValue: (option: T) => number;
    isOptionEqualToValue: (option: T, value: T) => boolean;
    formScope?: string;
    disabled?: boolean;
}

export function AsyncAutocomplete<T>({
    name,
    label,
    fetchOptions,
    getOptionLabel,
    getOptionValue,
    isOptionEqualToValue,
    formScope,
    disabled = false,
}: AsyncAutocompleteProps<T>) {
    const { control } = useFormContext();
    const [inputValue, setInputValue] = useState('');
    const [debouncedInput] = useDebounce(inputValue, 300);

    const { data: options = [], isFetching } = useQuery({
        queryKey: ['async-autocomplete', formScope ?? 'global', name, debouncedInput],
        queryFn: () => fetchOptions(debouncedInput),
        enabled: !!debouncedInput,
    });

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => {
                const selectedOption = options.find((opt) => getOptionValue(opt) === field.value) ?? null;

                return (
                    <Autocomplete
                        disabled={disabled}
                        options={options}
                        loading={isFetching}
                        inputValue={inputValue}
                        onInputChange={(_, val) => setInputValue(val)}
                        getOptionLabel={getOptionLabel}
                        isOptionEqualToValue={isOptionEqualToValue}
                        onChange={(_, option) => field.onChange(option ? getOptionValue(option) : undefined)}
                        value={selectedOption}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={label}
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                            />
                        )}
                    />
                )
            }}
        />
    );
}
