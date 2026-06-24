interface PermitNotificationDeps {
    prismaClient?: any;
    transporter?: any;
    now?: Date;
    daysBefore?: number;
}
export declare function processExpiringPermitNotifications(options?: PermitNotificationDeps): Promise<{
    sentCount: number;
    checkedCount: number;
    skippedCount: number;
    reason: string;
} | {
    sentCount: number;
    checkedCount: any;
    skippedCount: number;
    reason?: never;
}>;
export declare function startPermitExpirationNotifications(): (() => void) | null;
export {};
//# sourceMappingURL=notifications.service.d.ts.map