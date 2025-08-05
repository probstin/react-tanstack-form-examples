// ComplexForm.tsx
import { zodResolver } from '@hookform/resolvers/zod'
import DeleteIcon from '@mui/icons-material/Delete'
import {
    Box,
    Button,
    Grid,
    IconButton,
    Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form'
import {
    AutocompleteElement,
    SelectElement,
    TextFieldElement,
} from 'react-hook-form-mui'
import { z } from 'zod'

// 1. Zod schema
const ItemSchema = z.object({
    option1: z.string().min(1, 'Required'),
    option2: z.string().min(1, 'Required'),
    option3: z.string().min(1, 'Required'),
})

const FormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    country: z.string().min(1, 'Country is required'),
    tags: z.array(z.string()).min(1, 'Select at least one tag'),
    items: z.array(ItemSchema).min(1, 'At least one item'),
})

export type FormData = z.infer<typeof FormSchema>

// 2. Stubbed API calls (replace with real fetches)
const fetchCountries = async (): Promise<any[]> => [
    { id: 'us', label: 'United States' },
    { id: 'ca', label: 'Canada' },
    { id: 'mx', label: 'Mexico' },
]

const fetchTags = async (): Promise<any[]> => [
    { id: 'alpha', label: 'Alpha' },
    { id: 'beta', label: 'Beta' },
    { id: 'gamma', label: 'Gamma' },
]

const fetchOptions1 = async (): Promise<any[]> => [
    { id: 'o1', label: 'Option 1' },
    { id: 'o2', label: 'Option 2' },
]
const fetchOptions2 = async (): Promise<any[]> => [
    { id: 'p1', label: 'Pick 1' },
    { id: 'p2', label: 'Pick 2' },
]
const fetchOptions3 = async (): Promise<any[]> => [
    { id: 'x1', label: 'X 1' },
    { id: 'x2', label: 'X 2' },
]

// 3. Section: Basic info (text + single select)
const BasicInfoSection: React.FC = () => {
    const { data: countries = [] } = useQuery({
        queryKey: ['countries'],
        queryFn: fetchCountries
    })

    return (
        <Box mb={4}>
            <Typography variant="h6">Basic Information</Typography>
            <Grid container spacing={2} mt={1}>
                <Grid size={12}>
                    <TextFieldElement
                        name="name"
                        label="Name"
                        required
                    />
                </Grid>
                <Grid size={12}>
                    <SelectElement
                        name="country"
                        label="Country"
                        required
                        options={countries}
                    />
                </Grid>
            </Grid>
        </Box>
    )
}

// 4. Section: Autocomplete multi-select
const AutocompleteSection: React.FC = () => {
    const { data: tags = [], isLoading: loadingTags } = useQuery({
        queryKey: ['tags'],
        queryFn: fetchTags
    })

    return (
        <Box mb={4}>
            <Typography variant="h6">Tags</Typography>
            <AutocompleteElement
                name="tags"
                label="Select Tags"
                required
                multiple
                options={tags}
                loading={loadingTags}
            />
        </Box>
    )
}

// 5. Section: Array of items (3 selects per row)
const ItemsSection: React.FC = () => {
    const { control } = useFormContext<FormData>()
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
    })

    const { data: opts1 = [] } = useQuery({ queryKey: ['opts1'], queryFn: fetchOptions1 })
    const { data: opts2 = [] } = useQuery({ queryKey: ['opts2'], queryFn: fetchOptions2 })
    const { data: opts3 = [] } = useQuery({ queryKey: ['opts3'], queryFn: fetchOptions3 })

    return (
        <Box mb={4}>
            <Typography variant="h6">Items</Typography>
            {fields.map((field, idx) => (
                <Grid container spacing={2} alignItems="center" key={field.id} mt={1}>
                    <Grid size={3}>
                        <SelectElement
                            name={`items.${idx}.option1`}
                            label="Option 1"
                            required
                            options={opts1}
                        />
                    </Grid>
                    <Grid size={3}>
                        <SelectElement
                            name={`items.${idx}.option2`}
                            label="Option 2"
                            required
                            options={opts2}
                        />
                    </Grid>
                    <Grid size={3}>
                        <SelectElement
                            name={`items.${idx}.option3`}
                            label="Option 3"
                            required
                            options={opts3}
                        />
                    </Grid>
                    <Grid size={3}>
                        <IconButton
                            onClick={() => remove(idx)}
                            disabled={fields.length === 1}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            ))}
            <Box mt={2}>
                <Button variant="outlined" onClick={() => append({ option1: '', option2: '', option3: '' })}>
                    Add Item
                </Button>
            </Box>
        </Box>
    )
}

// 6. Main form component
export const FormSix: React.FC = () => {
    const methods = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: '',
            country: '',
            tags: [],
            items: [{ option1: '', option2: '', option3: '' }],
        },
        mode: 'onBlur',
    })

    const onSubmit = (data: FormData) => {
        console.log('Form Data:', data)
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
                <BasicInfoSection />
                <AutocompleteSection />
                <ItemsSection />

                <Box mt={4}>
                    <Button type="submit" variant="contained" fullWidth>
                        Submit
                    </Button>
                </Box>
            </form>
        </FormProvider>
    )
}
