import type { ButtonProps } from "@mui/material/Button";

export type Step = string;

export type ActionKey = "changeStatus" | "saveDraft";

export type OptionConfig = {
    label: string;
    color?: ButtonProps["color"];
    action: ActionKey;
    args?: unknown; // e.g., target status for changeStatus
};

// steps you never want to render from nextSteps
export const EXCLUDED_STEPS: Step[] = ["IN_TEST", "SMELLY"];

// Options shown because of the *current* status
export const STATUS_BASED_OPTIONS: Record<Step, OptionConfig[]> = {
    DRAFT: [{ label: "Save as Draft", color: "primary", action: "saveDraft" }],
    IN_COORD: [],
    POST_PENDING: [],
};

// Options shown when the API says you can transition to a specific next step
export const STATUS_CHANGE_OPTIONS: Record<Step, OptionConfig[]> = {
    ADVERTISED: [
        {
            label: "Move to Advertised",
            color: "secondary",
            action: "changeStatus",
            args: "ADVERTISED",
        },
    ],
    IN_COORD: [
        { label: "Move to In Coord", color: "primary", action: "changeStatus", args: "IN_COORD" },
    ],
    // add more as needed; unknown steps just resolve to []
};
