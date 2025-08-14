import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { AsyncAutocompleteSelect } from "./AsyncAutocompleteSelect";

// Your option shape for the autocomplete
type ResortOption = { id: number; label: string; resortCode: string }; // value = resortCode

// Search (supports resortCode or name fragments; server handles logic)
async function fetchResorts(term: string): Promise<ResortOption[]> {
    const res = await axios.get<ResortOption[]>("http://localhost:3001/api/pick-lists/resorts", {
        params: { q: term },
    });
    return res.data;
}

// Fetch advertisement to get resortCode for hydration
type Advertisement = { resortCode: string; advertisementName: string };
async function fetchAdvertisement(id: number): Promise<Advertisement> {
    const res = await axios.get<Advertisement>(`http://localhost:3001/api/advertisement`);
    return res.data;
}

// Demo component
export function FormEight({ adId }: { adId: number }) {
    const { data: ad, isLoading } = useQuery({
        queryKey: ["advertisement", adId],
        queryFn: () => fetchAdvertisement(adId),
        staleTime: 60_000,
    });

    const [resortCode, setResortCode] = useState<string | null>(null);

    // When ad loads, set resortCode (hydration value)
    useEffect(() => {
        if (ad?.resortCode) setResortCode(ad.resortCode);
    }, [ad?.resortCode]);

    if (isLoading) return <div>Loading advertisement…</div>;

    return (
        <AsyncAutocompleteSelect<ResortOption, string>
            label="Resort"
            placeholder="Search resorts…"
            minChars={2}
            debounceMs={300}
            fetchOptions={fetchResorts}
            getOptionLabel={(o) => o.label}
            getOptionValue={(o) => o.resortCode} // resortCode
            value={resortCode} // hydration via search for this code
            onChange={(val, opt) => setResortCode(val)}
            textFieldProps={{ helperText: "Select a resort" }}
            queryKeyBase={["resorts"]}
        />
    );
}