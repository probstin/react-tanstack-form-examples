import {
    Box,
    Button,
    Stack,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from '@mui/material';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { z } from 'zod';

// ----------------- STEP SCHEMAS ------------------
const basicInfoSchema = z.object({
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
});

const additionalInfoSchema = z.object({
    age: z
        .string()
        .refine((val) => /^\d+$/.test(val), { message: 'Must be a number' }),
    occupation: z.string().min(1, 'Occupation required'),
});

const contactInfoSchema = z.object({
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Phone number required'),
});

const fullSchema = basicInfoSchema
    .merge(additionalInfoSchema)
    .merge(contactInfoSchema);

type FormValues = z.infer<typeof fullSchema>;

// ----------------- FORM COMPONENT ------------------
const steps = ['Basic Info', 'Additional Info', 'Contact Info', 'Summary'];

export default function MultiStepForm() {
    const [activeStep, setActiveStep] = useState(0);

    const form = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            age: '',
            occupation: '',
            email: '',
            phone: '',
        },
        onSubmit: async ({ value }) => {
            alert(JSON.stringify(value, null, 2));
        },
        validate: (values) => {
            const result = fullSchema.safeParse(values);
            return result.success
                ? { success: true, value: result.data }
                : {
                    success: false,
                    errors: result.error.flatten().fieldErrors,
                };
        },
    });

    // Validation per step
    const stepSchemas = [basicInfoSchema, additionalInfoSchema, contactInfoSchema];

    const validateStep = async () => {
        const stepSchema = stepSchemas[activeStep];
        if (!stepSchema) return true;

        const currentValues = form.state.values;
        const result = stepSchema.safeParse(currentValues);
        if (result.success) return true;

        const errors = result.error.flatten().fieldErrors;
        Object.entries(errors).forEach(([key, value]) => {
            form.setFieldMeta(key as keyof FormValues, {
                errorMap: () => value,
            });
        });

        return false;
    };

    const handleNext = async () => {
        const isValid = await validateStep();
        if (isValid) setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    return (
        <Box>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Box component="form" onSubmit={form.handleSubmit} noValidate>
                <Stack spacing={3} maxWidth={500}>
                    {activeStep === 0 && (
                        <>
                            <form.Field name="firstName">
                                {(field) => (
                                    <TextField
                                        label="First Name"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        error={!!field.state.meta.errors?.length}
                                        helperText={field.state.meta.errors?.[0]}
                                    />
                                )}
                            </form.Field>

                            <form.Field name="lastName">
                                {(field) => (
                                    <TextField
                                        label="Last Name"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        error={!!field.state.meta.errors?.length}
                                        helperText={field.state.meta.errors?.[0]}
                                    />
                                )}
                            </form.Field>
                        </>
                    )}

                    {activeStep === 1 && (
                        <>
                            <form.Field name="age">
                                {(field) => (
                                    <TextField
                                        label="Age"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        error={!!field.state.meta.errors?.length}
                                        helperText={field.state.meta.errors?.[0]}
                                    />
                                )}
                            </form.Field>

                            <form.Field name="occupation">
                                {(field) => (
                                    <TextField
                                        label="Occupation"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        error={!!field.state.meta.errors?.length}
                                        helperText={field.state.meta.errors?.[0]}
                                    />
                                )}
                            </form.Field>
                        </>
                    )}

                    {activeStep === 2 && (
                        <>
                            <form.Field name="email">
                                {(field) => (
                                    <TextField
                                        label="Email"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        error={!!field.state.meta.errors?.length}
                                        helperText={field.state.meta.errors?.[0]}
                                    />
                                )}
                            </form.Field>

                            <form.Field name="phone">
                                {(field) => (
                                    <TextField
                                        label="Phone"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        error={!!field.state.meta.errors?.length}
                                        helperText={field.state.meta.errors?.[0]}
                                    />
                                )}
                            </form.Field>
                        </>
                    )}

                    {activeStep === 3 && (
                        <>
                            <Typography variant="h6">Review your info:</Typography>
                            {Object.entries(form.state.values).map(([key, value]) => (
                                <Typography key={key}>
                                    <strong>{key}:</strong> {value}
                                </Typography>
                            ))}
                        </>
                    )}

                    <Box display="flex" justifyContent="space-between" mt={2}>
                        <Button disabled={activeStep === 0} onClick={handleBack}>
                            Back
                        </Button>

                        {activeStep < steps.length - 1 ? (
                            <Button variant="contained" onClick={handleNext}>
                                Next
                            </Button>
                        ) : (
                            <Button variant="contained" type="submit">
                                Submit
                            </Button>
                        )}
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}
