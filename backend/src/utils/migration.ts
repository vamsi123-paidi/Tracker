import { v2 as cloudinary } from 'cloudinary';
import { User } from '../models/User.js';
import { Submission } from '../models/Submission.js';

export const migrateBase64ImagesToCloudinary = async (): Promise<void> => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.log('[MIGRATION]: Cloudinary not configured. Skipping Base64 clean-up.');
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });

  try {
    // 1. Migrate Users
    const usersWithBase64 = await User.find({ profileImage: { $regex: /^data:image/ } });
    if (usersWithBase64.length > 0) {
      console.log(`[MIGRATION]: Found ${usersWithBase64.length} users with Base64 profile images. Starting upload to Cloudinary...`);
      for (const user of usersWithBase64) {
        if (!user.profileImage) continue;
        try {
          const res = await cloudinary.uploader.upload(user.profileImage, {
            folder: 'tracker_profiles'
          });
          user.profileImage = res.secure_url;
          await user.save();
          console.log(`[MIGRATION]: Successfully migrated profile image for user: ${user.email}`);
        } catch (err: any) {
          console.error(`[MIGRATION]: Failed to upload profile image for user ${user.email}:`, err.message);
        }
      }
    }

    // 2. Migrate Submissions
    const submissionsWithBase64 = await Submission.find({ screenshotUrl: { $regex: /^data:image/ } });
    if (submissionsWithBase64.length > 0) {
      console.log(`[MIGRATION]: Found ${submissionsWithBase64.length} submissions with Base64 screenshots. Starting upload to Cloudinary...`);
      for (const sub of submissionsWithBase64) {
        if (!sub.screenshotUrl) continue;
        try {
          const res = await cloudinary.uploader.upload(sub.screenshotUrl, {
            folder: 'tracker_submissions'
          });
          sub.screenshotUrl = res.secure_url;
          await sub.save();
          console.log(`[MIGRATION]: Successfully migrated screenshot for submission ID: ${sub._id}`);
        } catch (err: any) {
          console.error(`[MIGRATION]: Failed to upload screenshot for submission ${sub._id}:`, err.message);
        }
      }
    }

    if (usersWithBase64.length > 0 || submissionsWithBase64.length > 0) {
      console.log('[MIGRATION]: Base64 clean-up completed successfully.');
    }
  } catch (err: any) {
    console.error('[MIGRATION]: Migration process failed:', err.message);
  }
};
