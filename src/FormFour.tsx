import { zodResolver } from '@hookform/resolvers/zod';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
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
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

import {
    Controller,
    useFieldArray,
    useForm
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
    input3: z.string().optional()
});

const formSchema = z.object({
    adType: z.string().nonempty('This field is required'),
    textInput: z.string().nonempty('This field is required'),
    singleSelect: z.string().nonempty('Please select an option'),
    multiSelect: z.array(z.string()).min(1, 'Select at least one'),
    selectArray: z.array(selectArraySchema),
    complexArray: z.array(complexArraySchema).min(1, 'At least one row is required'),
});

type FormValues = z.infer<typeof formSchema>;

const MOCK_ENTITY = {
    complexArray: [
        { select: "ABC", input1: "foo", input2: "bar", extraField: "baz" },
        { select: "DEF", input1: "", input2: "", extraField: "" },
    ],
};

function useEntity(id?: string) {
    return useQuery({
        queryKey: ["entity", id],
        queryFn: () => Promise.resolve(MOCK_ENTITY),
        enabled: Boolean(id)
    });
}

const defaultValues = {
    adType: '',
    textInput: '',
    singleSelect: '',
    multiSelect: [],
    selectArray: [],
    complexArray: [
        {
            select: '',
            input1: '',
            input2: '',
            input3: ''
        },
    ],
};

export const FormFour = ({ entityId }: { entityId?: string }) => {
    const [adTypeOptions, setAdTypeOptions] = useState<SelectOption[]>([]);
    const [singleOptions, setSingleOptions] = useState<SelectOption[]>([]);
    const [multiOptions, setMultiOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(true);

    const {
        control,
        handleSubmit,
        register,
        reset,
        watch,
        formState: { errors, isValid },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        reValidateMode: 'onChange',
        defaultValues,
    });

    const selectedAdType = watch('adType');

    const {
        data: entity,
        isLoading: entityLoading,
        isSuccess: entityLoaded,
    } = useEntity(entityId);

    useEffect(() => {
        if (entityLoaded && entity) {
            // If your API shape matches FormValues exactly you can reset directly.
            // Otherwise map/transform as needed.
            reset(entity);
        }
    }, [entity, entityLoaded, reset]);

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


    useEffect(() => {
        const fetchOptions = async () => {

            const adType = await Promise.resolve([
                { value: 'tbd', label: 'As a TBD' },
                { value: 'fromPosition', label: 'From a Position' },
            ]);

            const single = await Promise.resolve([
                { value: 'A', label: 'Option A' },
                { value: 'B', label: 'Option B' },
            ])

            const multi = await Promise.resolve([
                { value: 'ABC', label: 'Option ABC' },
                { value: 'B', label: 'B' },
                { value: 'C', label: 'C' },
            ]);

            setAdTypeOptions(adType);
            setSingleOptions(single);
            setMultiOptions(multi);
            setLoading(false);
        };
        fetchOptions();
    }, []);


    const onSubmit = (data: FormValues) => {
        console.log('Form Data:', data);
    };

    if (entityLoading) return <Typography>Loading...</Typography>;
    if (loading) return <Typography>Loading...</Typography>;

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} p={2}>
            <Accordion elevation={0} variant='outlined' expanded>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    <Typography component="span">Ad Type</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ borderTop: 1, borderColor: 'divider', padding: 3 }} >
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Controller
                                name="adType"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.adType}>
                                        <InputLabel>Single Select</InputLabel>
                                        <Select {...field} label="Single Select" slotProps={{ input: { required: true } }}
                                        >
                                            {adTypeOptions.map((opt) => (
                                                <MenuItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        <Typography variant="caption" color="error">
                                            {errors.adType?.message}
                                        </Typography>
                                    </FormControl>
                                )}
                            />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            <Accordion elevation={0} variant='outlined' disabled={!selectedAdType} expanded={!!selectedAdType}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    <Typography component="span">Advertisement Info</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ borderTop: 1, borderColor: 'divider', padding: 3 }} >
                    <Grid container spacing={2}>
                        <Grid size={12}>
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
                    </Grid>
                </AccordionDetails>
            </Accordion>

            <Accordion elevation={0} variant='outlined' disabled={!selectedAdType} expanded={!!selectedAdType}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    <Typography component="span">Position Info</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ borderTop: 1, borderColor: 'divider', padding: 3 }} >
                    <Grid size={12} >
                        <Typography variant="subtitle1">Select Array</Typography>
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
                            <Button variant="outlined" size="small" onClick={() => appendSelect({ select1: '', select2: '', select3: '' })}>
                                Add Row
                            </Button>
                        </Box>
                    </Grid>
                    <Grid size={12} >
                        <Typography variant="subtitle1">Complex Array</Typography>
                        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                            {complexFields.map((field, idx) => {
                                const selectValue = watch(`complexArray.${idx}.select`);

                                return <React.Fragment key={field.id}>
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
                                    <Grid size={{ xs: 12, sm: 2 }} >
                                        <TextField
                                            label="Input 1"
                                            fullWidth
                                            {...register(`complexArray.${idx}.input1` as const)}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 2 }} >
                                        <TextField
                                            label="Input 2"
                                            fullWidth
                                            {...register(`complexArray.${idx}.input2` as const)}
                                        />
                                    </Grid>
                                    {selectValue === 'ABC' && <Grid size={{ xs: 12, sm: 2 }} >
                                        <TextField
                                            label="Input 3"
                                            fullWidth
                                            {...register(`complexArray.${idx}.input2` as const)}
                                        />
                                    </Grid>}
                                    <Grid size={{ xs: 12, sm: 1 }} >
                                        <Button
                                            size='small'
                                            onClick={() => removeComplex(idx)}
                                            disabled={complexFields.length === 1}
                                        >
                                            Remove
                                        </Button>
                                    </Grid>
                                </React.Fragment>
                            })}
                        </Grid>
                        <Box mt={1}>
                            <Button variant="outlined" size="small" onClick={() => appendComplex({ select: '', input1: '', input2: '' })}>
                                Add Row
                            </Button>
                        </Box>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Button variant="contained" type="submit" disabled={!isValid}>
                    Submit
                </Button>
            </Box>
        </Box>
    );
};
