import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import * as React from "react";
import { useMemo, useState } from "react";
import {
    EXCLUDED_STEPS,
    STATUS_BASED_OPTIONS,
    STATUS_CHANGE_OPTIONS,
    type ActionKey,
    type OptionConfig,
    type Step,
} from "./actions.config";

type Props = {
    status?: Step;
    nextSteps: Step[];
    // same callback style as your button version
    onChangeStatus?: (to: Step) => Promise<void> | void;
    onSaveDraft?: () => Promise<void> | void;

    // optional UI tweaks
    label?: string;                 // default: "Actions"
    iconOnly?: boolean;             // if true, renders an icon button
    disabled?: boolean;             // externally disable the trigger
};

export default function ActionsMenu({
    status,
    nextSteps,
    onChangeStatus,
    onSaveDraft,
    label = "Actions",
    iconOnly = false,
    disabled = false,
}: Props) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [busy, setBusy] = useState(false);
    const open = Boolean(anchorEl);

    // simple action resolver (same approach as your buttons)
    const handlers: Record<ActionKey, (args?: unknown) => void> = {
        changeStatus: (to?: unknown) => {
            if (typeof to !== "string") return;
            setBusy(true);
            Promise.resolve(onChangeStatus?.(to)).finally(() => setBusy(false));
        },
        saveDraft: () => {
            setBusy(true);
            Promise.resolve(onSaveDraft?.()).finally(() => setBusy(false));
        }
    };

    const statusOptions = useMemo<OptionConfig[]>(() => {
        return status ? STATUS_BASED_OPTIONS[status] ?? [] : [];
    }, [status]);

    const nextStepOptions = useMemo<OptionConfig[]>(() => {
        if (!Array.isArray(nextSteps) || nextSteps.length === 0) return [];
        const filtered = nextSteps.filter((s) => !EXCLUDED_STEPS.includes(s));
        return filtered.flatMap((step) => STATUS_CHANGE_OPTIONS[step] ?? []);
    }, [nextSteps]);

    // merge + dedupe by label (keeps it naive & predictable)
    const options = useMemo<OptionConfig[]>(() => {
        const merged = [...statusOptions, ...nextStepOptions];
        const seen = new Set<string>();
        return merged.filter((o) => !seen.has(o.label) && seen.add(o.label));
    }, [statusOptions, nextStepOptions]);

    const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleItemClick = (opt: OptionConfig) => {
        handleClose();
        const fn = handlers[opt.action];
        fn?.(opt.args);
    };

    const triggerDisabled = disabled || busy || options.length === 0;

    return (
        <>
            {iconOnly ? (
                <Button
                    aria-label={label}
                    aria-controls={open ? "actions-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleOpen}
                    disabled={triggerDisabled}
                    variant="outlined"
                    startIcon={busy ? <CircularProgress size={16} /> : <MoreVertIcon />}
                />
            ) : (
                <Button
                    id="actions-trigger"
                    aria-controls={open ? "actions-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleOpen}
                    disabled={triggerDisabled}
                    variant="outlined"
                    endIcon={busy ? <CircularProgress size={16} /> : <ArrowDropDownIcon />}
                >
                    {label}
                </Button>
            )}

            <Menu
                id="actions-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                slotProps={{ paper: { sx: { minWidth: 220, maxHeight: 360 } }, list: { dense: true } }}
            >
                {options.length === 0 ? (
                    <MenuItem disabled>
                        <ListItemText primary="No actions available" />
                    </MenuItem>
                ) : (
                    options.map((opt) => (
                        <MenuItem
                            key={opt.label}
                            onClick={() => handleItemClick(opt)}
                            disabled={busy}
                        >
                            {opt.label}
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
}
