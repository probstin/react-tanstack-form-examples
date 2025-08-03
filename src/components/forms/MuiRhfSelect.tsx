import {
    CircularProgress,
    MenuItem,
    TextField,
    type TextFieldProps,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Controller, useFormContext } from 'react-hook-form';

export interface AsyncSelectProps<T> {
    name: string;
    label: string;
    fetchOptions: () => Promise<T[]>;
    getOptionLabel: (option: T) => string;
    getOptionValue: (option: T) => number;
    formScope?: string;
    initialOptions?: T[];
    disabled?: boolean;
    textFieldProps?: TextFieldProps;
}

export function AsyncSelect<T>({
    name,
    label,
    fetchOptions,
    getOptionLabel,
    getOptionValue,
    formScope,
    initialOptions,
    disabled = false,
    textFieldProps,
}: AsyncSelectProps<T>) {
    const { control } = useFormContext();

    const { data: options = [], isFetching } = useQuery({
        queryKey: ['async-select', formScope ?? 'global', name],
        queryFn: fetchOptions,
        initialData: initialOptions ?? [],
    });

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <TextField
                    {...textFieldProps}
                    select
                    fullWidth
                    label={label}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    disabled={disabled}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <>
                                    {isFetching && <CircularProgress size={18} sx={{ mr: 1 }} />}
                                </>
                            ),
                        }
                    }}
                >
                    {options.length === 0 && !isFetching ? (
                        <MenuItem disabled value="">
                            No options
                        </MenuItem>
                    ) : (
                        options.map((option) => (
                            <MenuItem key={getOptionValue(option)} value={String(getOptionValue(option))}>
                                {getOptionLabel(option)}
                            </MenuItem>
                        ))
                    )}
                </TextField>
            )}
        />
    );
}
