export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { initializeCronJobs, seedAdminUser } = await import('./utils/cron');
        initializeCronJobs();
        await seedAdminUser();
    }
}
