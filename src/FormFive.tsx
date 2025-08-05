// FormExample.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { AutocompleteElement, SelectElement } from 'react-hook-form-mui';
import { z } from 'zod';

const schema = z.object({
    country: z.coerce.number().min(1, 'Country is required'),
    resort: z.coerce.number().min(1, 'Resort is required'),
});

type FormValues = z.infer<typeof schema>;

const fetchCountries = async () => {
    const res = await fetch('http://localhost:3001/api/pick-lists/countries');
    return res.json() as Promise<{ id: number; label: string }[]>;
};

const fetchResorts = async () => {
    const res = await fetch('http://localhost:3001/api/pick-lists/resorts');
    return res.json() as Promise<{ id: number; label: string }[]>;
};

export function FormFive() {
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            country: '',
            resort: '',
        },
    });

    const { data: countries = [], isLoading: loadingCountries } = useQuery({
        queryKey: ['countries'],
        queryFn: fetchCountries,
    });

    const { data: resorts = [], isLoading: loadingResorts } = useQuery({
        queryKey: ['resorts'],
        queryFn: fetchResorts,
    });

    const onSubmit = (data: FormValues) => {
        console.log('Submitted:', data);
    };

    return (
        <FormProvider {...form}>
            <Box
                component="form"
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
                sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}
            >
                <SelectElement
                    name="country"
                    label="Country"
                    options={countries.map((c) => ({ id: c.id, label: c.label }))}
                    valueKey="id"
                    labelKey="label"
                    fullWidth
                    required
                />

                <AutocompleteElement
                    name="resort"
                    label="Resort"
                    options={resorts}
                    loading={loadingResorts}
                    matchId
                    textFieldProps={{ sx: { mt: 2 }, fullWidth: true }}
                />

                <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                    Submit
                </Button>
            </Box>
        </FormProvider>
    );
}
