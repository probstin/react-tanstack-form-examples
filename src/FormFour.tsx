import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import {
    Controller,
    useFieldArray,
    useForm,
} from 'react-hook-form';
import * as z from 'zod';

interface SelectOption {
    value: string;
    label: string;
}

const selectArraySchema = z.object({
    select1: z.string().nonempty('Select 1 is required'),
    select2: z.string().nonempty('Select 2 is required'),
    select3: z.string().nonempty('Select 3 is required'),
});

const complexArraySchema = z.object({
    select: z.string().nonempty('Select is required'),
    input1: z.string().optional(),
    input2: z.string().optional(),
});

const formSchema = z.object({
    textInput: z.string().nonempty('This field is required'),
    singleSelect: z.string().nonempty('Please select an option'),
    multiSelect: z.array(z.string()).min(1, 'Select at least one'),
    selectArray: z.array(selectArraySchema),
    complexArray: z.array(complexArraySchema).min(1, 'At least one row is required'),
});

type FormValues = z.infer<typeof formSchema>;

export const FormFour = () => {
    const {
        control,
        handleSubmit,
        register,
        formState: { errors, isValid },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        reValidateMode: 'onChange',
        defaultValues: {
            textInput: '',
            singleSelect: '',
            multiSelect: [],
            selectArray: [],
            complexArray: [
                {
                    select: '',
                    input1: '',
                    input2: '',
                },
            ],
        },
    });

    const [singleOptions, setSingleOptions] = useState<SelectOption[]>([]);
    const [multiOptions, setMultiOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOptions = async () => {
            const single = await Promise.resolve([
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' },
            ]);

            const multi = await Promise.resolve([
                { value: 'a', label: 'A' },
                { value: 'b', label: 'B' },
                { value: 'c', label: 'C' },
            ]);

            setSingleOptions(single);
            setMultiOptions(multi);
            setLoading(false);
        };
        fetchOptions();
    }, []);

    const {
        fields: selectFields,
        append: appendSelect,
        remove: removeSelect,
    } = useFieldArray({ name: 'selectArray', control });

    const {
        fields: complexFields,
        append: appendComplex,
        remove: removeComplex,
    } = useFieldArray({ name: 'complexArray', control });

    const onSubmit = (data: FormValues) => {
        console.log('Form Data:', data);
    };

    if (loading) return <Typography>Loading...</Typography>;

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} p={2}>
            <Grid container spacing={2}>
                <Grid size={12}>
                    <TextField
                        label="Text Input"
                        required
                        fullWidth
                        {...register('textInput')}
                        error={!!errors.textInput}
                        helperText={errors.textInput?.message}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                        name="singleSelect"
                        control={control}
                        render={({ field }) => (
                            <FormControl fullWidth error={!!errors.singleSelect}>
                                <InputLabel>Single Select</InputLabel>
                                <Select {...field} label="Single Select" slotProps={{ input: { required: true } }}
                                >
                                    {singleOptions.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <Typography variant="caption" color="error">
                                    {errors.singleSelect?.message}
                                </Typography>
                            </FormControl>
                        )}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} >
                    <Controller
                        name="multiSelect"
                        control={control}
                        render={({ field }) => (
                            <FormControl fullWidth error={!!errors.multiSelect}>
                                <InputLabel>Multi Select</InputLabel>
                                <Select
                                    multiple
                                    value={field.value}
                                    input={<OutlinedInput label="Multi Select" />}
                                    onChange={field.onChange}
                                    renderValue={(selected) =>
                                        (selected as string[]).map((val) =>
                                            multiOptions.find((opt) => opt.value === val)?.label
                                        ).join(', ')
                                    }
                                >
                                    {multiOptions.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            <Checkbox checked={field.value.includes(opt.value)} />
                                            <ListItemText primary={opt.label} />
                                        </MenuItem>
                                    ))}
                                </Select>
                                <Typography variant="caption" color="error">
                                    {errors.multiSelect?.message}
                                </Typography>
                            </FormControl>
                        )}
                    />
                </Grid>
                <Grid size={12} >
                    <Typography variant="h6">Select Array</Typography>
                    <Grid container spacing={2}>
                        {selectFields.map((field, idx) => (
                            <React.Fragment key={field.id}>
                                <Grid size={{ xs: 12, sm: 3 }} >
                                    <Controller
                                        name={`selectArray.${idx}.select1` as const}
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth>
                                                <InputLabel>Select 1</InputLabel>
                                                <Select {...field} label="Select 1">
                                                    {singleOptions.map((opt) => (
                                                        <MenuItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 3 }} >
                                    <Controller
                                        name={`selectArray.${idx}.select2` as const}
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth>
                                                <InputLabel>Select 2</InputLabel>
                                                <Select {...field} label="Select 2">
                                                    {singleOptions.map((opt) => (
                                                        <MenuItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 3 }} >
                                    <Controller
                                        name={`selectArray.${idx}.select3` as const}
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth>
                                                <InputLabel>Select 3</InputLabel>
                                                <Select {...field} label="Select 3">
                                                    {singleOptions.map((opt) => (
                                                        <MenuItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 3 }} >
                                    <Button onClick={() => removeSelect(idx)}>Remove</Button>
                                </Grid>
                            </React.Fragment>
                        ))}
                    </Grid>
                    <Box mt={1}>
                        <Button onClick={() => appendSelect({ select1: '', select2: '', select3: '' })}>
                            Add Row
                        </Button>
                    </Box>
                </Grid>
                <Grid size={12} >
                    <Typography variant="h6">Complex Array</Typography>
                    <Grid container spacing={2}>
                        {complexFields.map((field, idx) => (
                            <React.Fragment key={field.id}>
                                <Grid size={{ xs: 12, sm: 3 }} >
                                    <Controller
                                        name={`complexArray.${idx}.select` as const}
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth>
                                                <InputLabel>Option</InputLabel>
                                                <Select {...field} label="Option">
                                                    {multiOptions.map((opt) => (
                                                        <MenuItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 3 }} >
                                    <TextField
                                        label="Input 1"
                                        fullWidth
                                        {...register(`complexArray.${idx}.input1` as const)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 3 }} >
                                    <TextField
                                        label="Input 2"
                                        fullWidth
                                        {...register(`complexArray.${idx}.input2` as const)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 3 }} >
                                    <Button
                                        onClick={() => removeComplex(idx)}
                                        disabled={complexFields.length === 1}
                                    >
                                        Remove
                                    </Button>
                                </Grid>
                            </React.Fragment>
                        ))}
                    </Grid>
                    <Box mt={1}>
                        <Button onClick={() => appendComplex({ select: '', input1: '', input2: '' })}>
                            Add Row
                        </Button>
                    </Box>
                </Grid>
                <Grid size={12} >
                    <Button variant="contained" type="submit" disabled={!isValid}>
                        Submit
                    </Button>
                </Grid>
            </Grid>
        </Box >
    );
};
