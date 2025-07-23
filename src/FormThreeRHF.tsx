import { zodResolver } from '@hookform/resolvers/zod';
import {
    Box,
    Button,
    MenuItem,
    Stack,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

// --- Zod Schema ---
const basicInfoSchema = z.object({
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
    category: z.string().min(1, 'Category is required'),
});

const additionalInfoSchema = z.object({
    age: z.string().regex(/^\d+$/, 'Must be a number'),
    occupation: z.string().min(1, 'Required'),
});

const contactInfoSchema = z.object({
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Phone required'),
    birthDate: z.date({ error: 'Birth date required' }),
    entries: z
        .array(
            z.object({
                field1: z.string().min(1, 'Required'),
                field2: z.string().min(1, 'Required'),
                field3: z.string().min(1, 'Required'),
            }),
        )
        .min(1, 'At least one entry is required'),
});

const fullSchema = basicInfoSchema
    .merge(additionalInfoSchema)
    .merge(contactInfoSchema)
    .merge(z.object({ description: z.string().min(10, 'Description must be at least 10 characters') }));

type FormValues = z.infer<typeof fullSchema>;

// --- Component ---
export default function MultiStepFormRHF() {
    const [categories, setCategories] = useState<string[]>([]);
    const steps = ['Basic Info', 'Additional Info', 'Contact Info', 'Description', 'Summary'];
    const stepFields: (keyof FormValues)[][] = [
        ['firstName', 'lastName', 'category'],
        ['age', 'occupation'],
        ['email', 'phone', 'birthDate', 'entries'],
        ['description']
    ];

    const [activeStep, setActiveStep] = useState(0);

    const {
        control,
        handleSubmit,
        trigger,
        getValues,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            firstName: '',
            lastName: '',
            category: '',
            age: '',
            occupation: '',
            email: '',
            phone: '',
            birthDate: undefined,
            entries: [{ field1: '', field2: '', field3: '' }],
            description: '',
        },
        resolver: zodResolver(fullSchema),
        mode: 'onTouched',
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'entries',
    });

    const handleNext = async () => {
        const fieldsToValidate = stepFields[activeStep];
        const isValid = await trigger(fieldsToValidate);
        if (isValid) setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const onSubmit = (data: FormValues) => {
        alert(JSON.stringify(data, null, 2));
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Stack spacing={3} maxWidth={600}>
                {/* Step 0 */}
                {activeStep === 0 && (
                    <>
                        <Controller
                            name="firstName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    label="First Name"
                                    {...field}
                                    error={!!errors.firstName}
                                    helperText={errors.firstName?.message}
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    label="Last Name"
                                    {...field}
                                    error={!!errors.lastName}
                                    helperText={errors.lastName?.message}
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    select
                                    fullWidth
                                    label="Category"
                                    {...field}
                                    error={!!errors.category}
                                    helperText={errors.category?.message}
                                >
                                    {categories.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </>
                )}

                {/* Step 1 */}
                {activeStep === 1 && (
                    <>
                        <Controller
                            name="age"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    label="Age"
                                    {...field}
                                    error={!!errors.age}
                                    helperText={errors.age?.message}
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="occupation"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    label="Occupation"
                                    {...field}
                                    error={!!errors.occupation}
                                    helperText={errors.occupation?.message}
                                    fullWidth
                                />
                            )}
                        />
                    </>
                )}

                {/* Step 2 */}
                {activeStep === 2 && (
                    <>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    label="Email"
                                    {...field}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    label="Phone"
                                    {...field}
                                    error={!!errors.phone}
                                    helperText={errors.phone?.message}
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="birthDate"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    label="Birth Date"
                                    value={field.value ? dayjs(field.value) : null}
                                    onChange={(date) => field.onChange(date?.toDate() ?? null)}
                                    slotProps={{
                                        textField: {
                                            error: !!errors.birthDate,
                                            helperText: errors.birthDate?.message,
                                            fullWidth: true,
                                        },
                                    }}
                                />
                            )}
                        />
                        <Typography variant="h6" mt={2}>
                            Entries
                        </Typography>
                        {fields.map((item, index) => (
                            <Stack key={item.id} spacing={2} direction="row">
                                <Controller
                                    name={`entries.${index}.field1`}
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            label="Field 1"
                                            {...field}
                                            error={!!errors.entries?.[index]?.field1}
                                            helperText={errors.entries?.[index]?.field1?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name={`entries.${index}.field2`}
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            label="Field 2"
                                            {...field}
                                            error={!!errors.entries?.[index]?.field2}
                                            helperText={errors.entries?.[index]?.field2?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name={`entries.${index}.field3`}
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            label="Field 3"
                                            {...field}
                                            error={!!errors.entries?.[index]?.field3}
                                            helperText={errors.entries?.[index]?.field3?.message}
                                        />
                                    )}
                                />
                                <Button
                                    onClick={() => remove(index)}
                                    disabled={fields.length === 1}
                                >
                                    Remove
                                </Button>
                            </Stack>
                        ))}
                        <Button
                            variant="outlined"
                            onClick={() => append({ field1: '', field2: '', field3: '' })}
                        >
                            Add Entry
                        </Button>
                    </>
                )}

                {activeStep === 3 && (
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                label="Description"
                                multiline
                                minRows={4}
                                fullWidth
                                {...field}
                                value={field.value ?? ''}
                                error={!!errors.description}
                                helperText={errors.description?.message}
                            />
                        )}
                    />
                )}

                {activeStep === 4 && (
                    <>
                        <Typography variant="h6">Summary</Typography>
                        <pre>{JSON.stringify(getValues(), null, 2)}</pre>
                    </>
                )}

                {/* Navigation */}
                <Box display="flex" justifyContent="space-between">
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
    );
}
