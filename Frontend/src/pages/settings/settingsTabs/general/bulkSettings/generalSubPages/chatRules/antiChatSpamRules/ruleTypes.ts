export interface AntiChatSpamRule {
    ruleName: string;
    enabled: boolean;
    AmountLastMins: string;
    ViolationRateExceeds: string;
    SameMessageMoreThan: string;
    MaxViolationsBeforeAction: string;
    Action: "Warn" | "Mute" | "Kick" | "Ban";
    Message: string;
}