import { AddCircle, RemoveCircle } from '@mui/icons-material';
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormHelperText,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import { useForm } from '@tanstack/react-form';
import { useEffect, useState } from 'react';
import { z } from 'zod';

// Zod schema for form validation
const schema = z.object({
    firstName: z.string().nonempty({ message: 'First name is required' }),
    lastName: z.string().nonempty({ message: 'Last name is required' }),
    bio: z.string()
        .min(10, { message: 'Bio must be at least 10 characters' })
        .max(100, { message: 'Bio must be at most 100 characters' }),
    agree: z.boolean().refine(val => val, { message: 'You must accept terms' }),
    hobbies: z.array(
        z.object({ hobby: z.string().nonempty({ message: 'Hobby is required' }) })
    ).min(1, { message: 'Please add at least one hobby' }),
    favoriteOptions: z.array(z.string()).min(1, { message: 'Select at least one option' }),
});

export default function ComplexForm() {
    const [options, setOptions] = useState<string[]>([]);

    // Simulate async fetch for select options
    useEffect(() => {
        setTimeout(() => {
            setOptions(['Option A', 'Option B', 'Option C', 'Option D']);
        }, 500);
    }, []);

    const { Field, handleSubmit, state } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            bio: '',
            agree: false,
            hobbies: [{ hobby: '' }],
            favoriteOptions: [] as string[],
        },
        validators: { onSubmit: schema },
        onSubmit: ({ value }) => console.log('Form submitted:', value),
    });

    const getError = (errors: unknown[]): string | undefined => {
        const err = errors[0] as any;
        return err?.message;
    };

    return (
        <Paper
            component="form"
            onSubmit={e => { e.preventDefault(); handleSubmit(); }}
            sx={{ maxWidth: 600, mx: 'auto', p: 2 }}
        >
            {/* First Name */}
            <Field name="firstName">
                {({ state: fieldState, handleChange, handleBlur }) => (
                    <TextField
                        label="First Name"
                        value={fieldState.value}
                        onChange={e => handleChange(e.target.value)}
                        onBlur={handleBlur}
                        error={!fieldState.meta.isValid}
                        helperText={getError(fieldState.meta.errors)}
                        fullWidth
                        margin="normal"
                    />
                )}
            </Field>

            {/* Last Name */}
            <Field name="lastName">
                {({ state: fieldState, handleChange, handleBlur }) => (
                    <TextField
                        label="Last Name"
                        value={fieldState.value}
                        onChange={e => handleChange(e.target.value)}
                        onBlur={handleBlur}
                        error={!fieldState.meta.isValid}
                        helperText={getError(fieldState.meta.errors)}
                        fullWidth
                        margin="normal"
                    />
                )}
            </Field>

            {/* Bio */}
            <Field name="bio">
                {({ state: fieldState, handleChange, handleBlur }) => (
                    <TextField
                        label="Bio"
                        value={fieldState.value}
                        onChange={e => handleChange(e.target.value)}
                        onBlur={handleBlur}
                        error={!fieldState.meta.isValid}
                        helperText={`${fieldState.value.length}/100 ${getError(fieldState.meta.errors) ?? ''}`}
                        fullWidth
                        margin="normal"
                        multiline
                        minRows={3}
                        inputProps={{ maxLength: 100 }}
                    />
                )}
            </Field>

            {/* Agree to Terms */}
            <Field name="agree">
                {({ state: fieldState, handleChange }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <Checkbox
                            checked={fieldState.value}
                            onChange={e => handleChange(e.target.checked)}
                        />
                        <Typography>I agree to the terms and conditions</Typography>
                        {getError(fieldState.meta.errors) && (
                            <Typography sx={{ color: 'error.main', ml: 1 }}>
                                {getError(fieldState.meta.errors)}
                            </Typography>
                        )}
                    </Box>
                )}
            </Field>

            {/* Hobbies (Field Array) */}
            <Field name="hobbies" mode="array">
                {field => (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6">Hobbies</Typography>
                        {field.state.value.map((_, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Field name={`hobbies[${index}].hobby`}>
                                    {({ state: hobbyState, handleChange: handleHobbyChange, handleBlur: handleHobbyBlur }) => (
                                        <TextField
                                            label={`Hobby #${index + 1}`}
                                            value={hobbyState.value}
                                            onChange={e => handleHobbyChange(e.target.value)}
                                            onBlur={handleHobbyBlur}
                                            error={!hobbyState.meta.isValid}
                                            helperText={getError(hobbyState.meta.errors)}
                                            fullWidth
                                        />
                                    )}
                                </Field>
                                <IconButton
                                    onClick={() => field.removeValue(index)}
                                    disabled={field.state.value.length === 1}
                                >
                                    <RemoveCircle />
                                </IconButton>
                            </Box>
                        ))}
                        <Button
                            type="button"
                            startIcon={<AddCircle />}
                            onClick={() => field.pushValue({ hobby: '' })}
                        >Add Hobby</Button>
                        {getError(field.state.meta.errors) && (
                            <Typography sx={{ color: 'error.main', mt: 1 }}>
                                {getError(field.state.meta.errors)}
                            </Typography>
                        )}
                    </Box>
                )}
            </Field>

            {/* Multi-Select (Async Options) */}
            <Field name="favoriteOptions">
                {({ state: fieldState, handleChange }) => (
                    <FormControl fullWidth margin="normal" error={!fieldState.meta.isValid}>
                        <InputLabel id="multi-select-label">Favorite Options</InputLabel>
                        <Select
                            labelId="multi-select-label"
                            multiple
                            value={fieldState.value}
                            onChange={e => handleChange(e.target.value as string[])}
                            label="Favorite Options"
                            renderValue={selected => (selected as string[]).join(', ')}
                        >
                            {options.map(option => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>
                            {getError(fieldState.meta.errors) || 'Select one or more options'}
                        </FormHelperText>
                    </FormControl>
                )}
            </Field>

            {/* Submit Button */}
            <Box sx={{ mt: 4 }}>
                <Button type="submit" variant="contained" disabled={!state.canSubmit}>
                    Submit
                </Button>
            </Box>
        </Paper>
    );
}
