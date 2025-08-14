import Button from "@mui/material/Button";
import { useMemo, useState } from "react";
import {
    STATUS_BASED_OPTIONS,
    STATUS_CHANGE_OPTIONS,
    type ActionKey,
    type OptionConfig,
    type Step,
} from "./actions.config";
import { Stack } from "@mui/material";

type Props = {
    status?: Step;
    nextSteps: Step[];
    excludedSteps?: Step[]
    onChangeStatus?: (to: Step) => Promise<void> | void;
    onSaveDraft?: () => Promise<void> | void;
};

export default function ActionsButtons({
    status,
    nextSteps,
    excludedSteps = [],
    onChangeStatus,
    onSaveDraft,
}: Props) {
    const [busy, setBusy] = useState(false);

    // simple action resolver (kept in the component; mappings stay in config)
    const handlers: Record<ActionKey, (args?: unknown) => void> = {
        changeStatus: (to?: unknown) => {
            if (typeof to !== "string") return;
            setBusy(true);
            Promise.resolve(onChangeStatus?.(to)).finally(() => setBusy(false));
        },
        saveDraft: () => {
            onSaveDraft?.();
        }
    };

    const statusOptions = useMemo<OptionConfig[]>(() => {
        return status ? STATUS_BASED_OPTIONS[status] ?? [] : [];
    }, [status]);

    const nextStepOptions = useMemo<OptionConfig[]>(() => {
        if (!Array.isArray(nextSteps) || nextSteps.length === 0) return [];
        const filtered = nextSteps.filter((s) => !excludedSteps.includes(s));
        return filtered.flatMap((step) => STATUS_CHANGE_OPTIONS[step] ?? []);
    }, [nextSteps]);

    // merge + dedupe by label (optional but handy if config overlaps)
    const options = useMemo<OptionConfig[]>(() => {
        const merged = [...statusOptions, ...nextStepOptions];
        const seen = new Set<string>();
        return merged.filter((o) => !seen.has(o.label) && seen.add(o.label));
    }, [statusOptions, nextStepOptions]);

    return (
        <Stack direction="row" gap={1}>
            {options.map((opt) => (
                <Button
                    key={opt.label}
                    variant="outlined"
                    color={opt.color ?? "primary"}
                    onClick={() => handlers[opt.action]?.(opt.args)}
                    disabled={busy}
                >
                    {opt.label}
                </Button>
            ))}
        </Stack>
    );
}
