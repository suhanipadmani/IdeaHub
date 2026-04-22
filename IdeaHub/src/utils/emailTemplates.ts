export const getIdeaStatusEmailTemplate = (
    userName: string,
    ideaTitle: string,
    status: 'approved' | 'rejected',
    comment: string
) => {
    const isApproved = status === 'approved';
    const color = isApproved ? '#10B981' : '#EF4444'; // Emerald for approved, Red for rejected
    const headerTitle = isApproved ? 'Project Approved!' : 'Project Review Update';
    const messageInfo = isApproved
        ? 'Congratulations! Your startup idea has been reviewed and officially approved by the admin team. It is now published on the public IdeaHub.'
        : 'Your startup idea has been reviewed. Unfortunately, it did not pass the criteria for approval at this time. Please see the administration feedback below.';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #e5e7eb;
        }
        .header {
            background-color: ${color};
            padding: 32px 24px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 24px;
            margin: 0;
            font-weight: 800;
            letter-spacing: -0.025em;
        }
        .content {
            padding: 32px 24px;
        }
        .greeting {
            font-size: 18px;
            color: #111827;
            font-weight: 600;
            margin-bottom: 24px;
        }
        .idea-title {
            background: #f3f4f6;
            padding: 16px;
            border-radius: 8px;
            font-size: 16px;
            color: #374151;
            font-weight: 700;
            text-align: center;
            margin-bottom: 24px;
            border-left: 4px solid ${color};
        }
        .text {
            font-size: 16px;
            color: #4b5563;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .feedback-box {
            background-color: #fdfbf7;
            border: 1px solid #f3e8ff;
            border-radius: 12px;
            padding: 24px;
            margin-top: 24px;
        }
        .feedback-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .feedback-text {
            font-size: 15px;
            color: #374151;
            font-style: italic;
            line-height: 1.5;
            margin: 0;
        }
        .footer {
            background: #f9fafb;
            padding: 24px;
            text-align: center;
            font-size: 14px;
            color: #9ca3af;
            border-top: 1px solid #e5e7eb;
        }
        .footer p { margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${headerTitle}</h1>
        </div>
        <div class="content">
            <div class="greeting">Hi ${userName},</div>
            
            <div class="idea-title">
                ${ideaTitle}
            </div>

            <div class="text">
                ${messageInfo}
            </div>

            ${comment ? `
            <div class="feedback-box">
                <div class="feedback-label">Admin Feedback</div>
                <p class="feedback-text">"${comment}"</p>
            </div>
            ` : ''}

            <div class="text" style="margin-top: 32px;">
                ${isApproved ? 'You can view your published idea on your dashboard. Keep building!' : 'You can revise your idea and submit a new one when you are ready. Keep pushing forward!'}
            </div>
            
            <div class="text">
                Best regards,<br>
                <strong>The IdeaHub Team</strong>
            </div>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} IdeaHub Platform. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
};


export const getAdminWeeklyDigestTemplate = (
    adminName: string,
    pendingCount: number
) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; }
        .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 24px; margin: 0; font-weight: 800; }
        .content { padding: 40px 32px; text-align: center; }
        .count-box { background: #EEF2FF; border-radius: 24px; padding: 32px; margin: 24px 0; border: 1px solid #E0E7FF; }
        .number { font-size: 48px; font-weight: 900; color: #4F46E5; margin: 0; line-height: 1; }
        .label { font-size: 16px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 12px; }
        .text { font-size: 16px; color: #4b5563; line-height: 1.6; }
        .btn { display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 24px; }
        .footer { background: #f9fafb; padding: 24px; text-align: center; font-size: 14px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Weekly Platform Digest</h1>
        </div>
        <div class="content">
            <h2 style="margin-top:0; color:#111827; font-size:20px;">Hello ${adminName},</h2>
            <p class="text">Here is your weekly summary of outstanding tasks that need your attention.</p>
            
            <div class="count-box">
                <p class="number">${pendingCount}</p>
                <div class="label">Pending Ideas to Review</div>
            </div>

            <p class="text">Log in to your admin dashboard to review these ideas, keep the pipeline moving, and discover the next big startup!</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/reviews/pending" class="btn">View Pending Ideas</a>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} IdeaHub System Notifications</p>
        </div>
    </div>
</body>
</html>
    `;
};
