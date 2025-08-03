import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AsyncAutocomplete } from './components/forms/MuiRhfAutocomplete';
import { AsyncSelect } from './components/forms/MuiRhfSelect';
import { DevTool } from '@hookform/devtools';

const optionSchema = z.object({
    id: z.number(),
    label: z.string(),
});

const formSchema = z.object({
    country: z.number().min(1, 'Country is required'),
    resort: z.number().min(1, 'Resort is required'),
});

const fetchResorts = async (input: string): Promise<Option[]> => {
    const res = await fetch(`http://localhost:3001/api/pick-lists/resorts?q=${encodeURIComponent(input)}`);
    return res.json();
};

type FormValues = z.infer<typeof formSchema>;
type Option = z.infer<typeof optionSchema>;

function FormFive(): React.ReactElement {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            country: undefined,
            resort: undefined,
        },
    });

    const onSubmit = (data: FormValues) => {
        console.log('Submitted:', data);
    };

    return (
        <>
            <DevTool control={form.control} />
            <FormProvider {...form}>
                <Box
                    component="form"
                    onSubmit={form.handleSubmit(onSubmit)}
                    noValidate
                    sx={{ mt: 2 }}
                >
                    <AsyncSelect<Option>
                        name="country"
                        label="Country"
                        fetchOptions={() => fetch('http://localhost:3001/api/pick-lists/countries').then((res) => res.json())}
                        getOptionLabel={(o) => o.label}
                        getOptionValue={(o) => o.id}
                        formScope="user-edit-form"
                        initialOptions={[]}
                    />
                    <AsyncAutocomplete<Option>
                        name="resort"
                        label="Resort"
                        fetchOptions={fetchResorts}
                        getOptionLabel={(o) => o.label}
                        getOptionValue={(o) => o.id}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                    />
                    <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                        Submit
                    </Button>
                </Box>
            </FormProvider>
        </>
    );
}

export default FormFive;
