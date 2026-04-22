import cron from 'node-cron';
import connectDB from '@/lib/db';
import { ProjectIdea } from '@/models/ProjectIdea';
import { User } from '@/models/User';
import sendEmail from '@/lib/email';
import { getAdminWeeklyDigestTemplate } from './emailTemplates';
import bcrypt from 'bcrypt';

export function initializeCronJobs() {
    console.log('Initializing cron jobs...');

    // Run every Monday at 9:00 AM
    cron.schedule('0 9 * * 1', async () => {
        console.log('Running weekly admin digest cron job...');
        
        try {
            await connectDB();
            
            // Get count of pending ideas
            const pendingCount = await ProjectIdea.countDocuments({ status: 'pending' });
            
            if (pendingCount > 0) {
                // Fetch all admins
                const admins = await User.find({ role: 'admin' }, 'name email');
                
                for (const admin of admins) {
                    const htmlMessage = getAdminWeeklyDigestTemplate(admin.name || 'Admin', pendingCount);
                    
                    await sendEmail({
                        email: admin.email,
                        subject: 'Weekly Digest: Pending Project Ideas to Review',
                        message: htmlMessage
                    });
                }
                console.log(`Sent weekly digest email to ${admins.length} admins.`);
            } else {
                console.log('No pending ideas to report. Digest skipped.');
            }
        } catch (error) {
            console.error('Error executing weekly digest cron job:', error);
        }
    });
}

export async function seedAdminUser() {
    try {
        await connectDB();
        
        // Check if any user exists
        const userCount = await User.countDocuments();
        
        if (userCount === 0) {
            console.log('No users found in database. Seeding default admin...');
            
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await User.create({
                name: 'System Admin',
                email: 'admin@gmail.com',
                password: hashedPassword,
                role: 'admin'
            });
            
            console.log('Default admin seeded: admin@gmail.com / admin123');
        } else {
            console.log('Database already has users. Skipping admin seeding.');
        }
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
}
