import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, MenuItem, Paper, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm } from '@tanstack/react-form';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { z } from 'zod';

const dateRangeSchema = z
    .object({
        fromDate: z.date({ error: 'Start date is required' }),
        toDate: z.date({ error: 'End date is required' }),
        favoriteOptions: z.string().nonempty('Favorite option is required'),
        checkboxOptions: z.array(z.string())
    })
    .refine(
        (data) => data.toDate >= data.fromDate,
        { message: 'End date must be after start date', path: ['toDate'] }
    );

function FormTwo(): React.ReactElement {
    const { Field, handleSubmit, state } = useForm({
        defaultValues: {
            fromDate: null as Date | null,
            toDate: null as Date | null,
            favoriteOptions: '',
            checkboxOptions: [] as string[]
        },
        validators: { onSubmit: dateRangeSchema },
        onSubmit: ({ value }) => {
            console.log('Form submitted:', value);
        },
    });

    const [options, setOptions] = useState<string[]>([]);

    useEffect(() => {
        setTimeout(() => {
            setOptions(['Option A', 'Option B', 'Option C', 'Option D']);
        }, 500);
    }, []);

    const checkboxOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];

    return (
        <Paper
            component="form"
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
            noValidate
            sx={{ p: 2 }}
        >
            <Grid container spacing={2} gap={2}>
                <Grid size={6}>
                    <Field name="fromDate">
                        {({ state, handleChange }) => (
                            <DatePicker
                                label="From Date"
                                value={state.value ? dayjs(state.value) : null}
                                onChange={(date) => handleChange(date?.toDate() ?? null)}
                                slotProps={{
                                    textField: {
                                        error: !!state.meta.errors?.length,
                                        helperText: state.meta.errors?.[0]?.message,
                                        fullWidth: true,
                                        required: true,
                                    },
                                }}
                            />
                        )}
                    </Field>
                </Grid>
                <Grid size={6}>
                    <Field name="toDate">
                        {({ state, handleChange }) => (
                            <DatePicker
                                label="To Date"
                                value={state.value ? dayjs(state.value) : null}
                                onChange={(date) => handleChange(date?.toDate() ?? null)}
                                slotProps={{
                                    textField: {
                                        error: !!state.meta.errors?.length,
                                        helperText: state.meta.errors?.[0]?.message,
                                        fullWidth: true,
                                        required: true,
                                    },
                                }}
                            />
                        )}
                    </Field>
                </Grid>
                <Grid size={12}>
                    <Field name="favoriteOptions">
                        {({ state: fieldState, handleChange }) => (
                            <TextField
                                fullWidth
                                select
                                label="Category"
                                value={fieldState.value}
                                onChange={(e) => handleChange(e.target.value)}
                                error={!!fieldState.meta.errors?.length}
                                helperText={fieldState.meta.errors?.[0]?.message}
                            >
                                {options.map(option => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        )}
                    </Field>
                </Grid>
                <Grid size={12}>
                    <Field name="checkboxOptions">
                        {(field) => (
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Select Options</FormLabel>
                                <FormGroup>
                                    {checkboxOptions.map((label) => (
                                        <FormControlLabel
                                            key={label}
                                            control={
                                                <Checkbox
                                                    checked={field.state.value.includes(label)}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        const updated = checked
                                                            ? [...field.state.value, label]
                                                            : field.state.value.filter((v) => v !== label);
                                                        field.handleChange(updated);
                                                    }}
                                                />
                                            }
                                            label={label}
                                        />
                                    ))}
                                </FormGroup>
                            </FormControl>
                        )}
                    </Field>
                </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
                <Button type="submit" variant="contained" disabled={!state.canSubmit}>
                    Submit
                </Button>
            </Box>
        </Paper>
    );
}

export default FormTwo;
