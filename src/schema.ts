// schema.ts
import dayjs from 'dayjs';
import { z } from 'zod';

export const formSchema = z
    .object({
        fromDate: z.date({ error: "From date is required" }),
        toDate: z.date({ error: "To date is required" }),
    })
    .refine(
        (data) => dayjs(data.toDate).isAfter(data.fromDate),
        { message: "To date must be after From date", path: ["toDate"] }
    );

export type FormValues = z.infer<typeof formSchema>;
