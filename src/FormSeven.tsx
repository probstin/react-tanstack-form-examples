import { ChrmsAutocomplete, ChrmsSelect } from '@chrms/react-form-elements';
import { zodResolver } from "@hookform/resolvers/zod";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Box, Button, Divider, Grid, IconButton } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from 'react';
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    country: z.string().nonempty("Country is required"),
    city: z.string().nonempty("City is required"),
    testing: z.array(
        z.object({
            country: z.string().nonempty("Country is required"),
            city: z.string().nonempty("City is required"),
        })
    )
});

type FormValues = z.infer<typeof formSchema>;

const useCities = (citySearch: string) => {
    return useQuery({
        queryKey: ["cities", citySearch],
        queryFn: () =>
            axios
                .get("http://localhost:3001/api/pick-lists/resorts", { params: { q: citySearch } })
                .then((res) => res.data),
        enabled: !!citySearch,
        initialData: []
    });
}

const useCountries = () => {
    return useQuery({
        queryKey: ["countries"],
        queryFn: () => axios.get("http://localhost:3001/api/pick-lists/countries").then((res) => res.data),
        initialData: []
    });
}

const defaultValues = { country: "", city: "", testing: [] };

export function FormSeven() {
    const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues });
    const [citySearch, setCitySearch] = useState("");
    const countries = useCountries();
    const cities = useCities(citySearch);
    const testingFieldArray = useFieldArray({ control: form.control, name: "testing" });

    const onSubmit = (values: FormValues) => {
        console.log("Form values:", values);
    };

    const onSaveAsDraft = () => {
        console.log(form.getValues());
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <Grid container spacing={3}>
                    <Grid size={12}>
                        <ChrmsSelect<{ label: string; value: string }>
                            name="country"
                            label="Country"
                            options={countries.data}
                            optionLabelKey="label"
                            optionValueKey="value"
                        />
                    </Grid>
                    <Grid size={12}>
                        <ChrmsAutocomplete<{ label: string; value: string }>
                            name="city"
                            label="City"
                            options={cities.data}
                            optionLabelKey="label"
                            optionValueKey="value"
                            onSearch={setCitySearch}
                            debounceTime={300}
                        />
                    </Grid>
                    {testingFieldArray.fields.map((field, index) => (
                        <React.Fragment key={field.id}>
                            <Grid size={5}>
                                <ChrmsSelect<{ label: string; value: string }>
                                    name={`testing.${index}.country`}
                                    label="Country"
                                    options={countries.data}
                                    optionLabelKey="label"
                                    optionValueKey="value"
                                />
                            </Grid>
                            <Grid size={5}>
                                <ChrmsAutocomplete<{ label: string; value: string }>
                                    name={`testing.${index}.city`}
                                    label="City"
                                    options={cities.data}
                                    optionLabelKey="label"
                                    optionValueKey="value"
                                    onSearch={setCitySearch}
                                    debounceTime={300}
                                />
                            </Grid>
                            <Grid size={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                                <IconButton onClick={() => testingFieldArray.remove(index)}>
                                    <RemoveCircleOutlineIcon />
                                </IconButton>
                            </Grid>
                        </React.Fragment>
                    ))}
                </Grid>
                <Box mt={3}>
                    <Button
                        disableElevation
                        variant="outlined"
                        onClick={() => testingFieldArray.append({ city: "", country: "" })}
                        startIcon={<AddCircleOutlineIcon />}
                    >
                        Add Another
                    </Button>
                </Box>
                <Divider sx={{ marginY: 3 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                    <Button
                        disableElevation
                        variant="outlined"
                        onClick={onSaveAsDraft}
                    >
                        Save as Draft
                    </Button>
                    <Button
                        disableElevation
                        type="submit"
                        variant="contained"
                        disabled={form.formState.isSubmitting}
                    >
                        Submit
                    </Button>
                </Box>
            </form>
        </FormProvider>
    );
}
