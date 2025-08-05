import { ChrmsAutocomplete, ChrmsSelect } from '@chrms/react-form-elements';
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    country: z.string().nonempty("Country is required"),
    city: z.string().nonempty("City is required"),
});
type FormValues = z.infer<typeof formSchema>;

export function FormSeven() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { country: "", city: "" },
    });

    const { data: countries = [] } = useQuery({
        queryKey: ["countries"],
        queryFn: () => axios.get("http://localhost:3001/api/pick-lists/countries").then((res) => res.data)
    });

    const [citySearch, setCitySearch] = useState("");

    const {
        data: cities = [],
    } = useQuery({
        queryKey: ["cities", citySearch],
        queryFn: () =>
            axios
                .get("http://localhost:3001/api/pick-lists/resorts", { params: { q: citySearch } })
                .then((res) => res.data),
        enabled: !!citySearch
    });

    const onSubmit = (values: FormValues) => {
        console.log("Form values:", values);
    };

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <ChrmsSelect
                    name="country"
                    label="Country"
                    options={countries}
                    optionLabelKey="label"
                    optionValueKey="value"
                />
                <ChrmsAutocomplete
                    name="city"
                    label="City"
                    options={cities}
                    optionLabelKey="label"
                    optionValueKey="value"
                    onSearch={setCitySearch}
                    debounceTime={300}
                />
                <Box mt={4}>
                    <Button
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
