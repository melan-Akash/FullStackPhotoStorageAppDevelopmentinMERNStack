import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from './config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

console.log('====================================================');
console.log('   Cloudinary API & AI Auto-Tagging Test Suite');
console.log('====================================================\n');

// 1. Check environment variables
console.log('1. Checking Environment Variables...');
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error('❌ Cloudinary environment variables are missing in .env!');
    console.error({
        CLOUDINARY_CLOUD_NAME: CLOUDINARY_CLOUD_NAME ? '✓ Defined' : '✗ Missing',
        CLOUDINARY_API_KEY: CLOUDINARY_API_KEY ? '✓ Defined' : '✗ Missing',
        CLOUDINARY_API_SECRET: CLOUDINARY_API_SECRET ? '✓ Defined' : '✗ Missing',
    });
    process.exit(1);
}

console.log('   ✓ CLOUDINARY_CLOUD_NAME:', CLOUDINARY_CLOUD_NAME);
console.log('   ✓ CLOUDINARY_API_KEY:   ', CLOUDINARY_API_KEY.replace(/.(?=.{4})/g, '*'));
console.log('   ✓ CLOUDINARY_API_SECRET:', '****** (Loaded)');

// Sample public image URL
const SAMPLE_IMAGE_URL = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=800&auto=format&fit=crop';

async function testCloudinary() {
    let uploadedPublicId = null;

    try {
        // 2. Test Connection & Upload
        console.log('\n2. Testing Cloudinary Upload Connection...');
        console.log('   Sample Image URL:   ', SAMPLE_IMAGE_URL);

        const uploadOptions = {
            folder: 'test_uploads',
            resource_type: 'auto',
        };

        const result = await cloudinary.uploader.upload(SAMPLE_IMAGE_URL, uploadOptions);
        uploadedPublicId = result.public_id;

        console.log('\n====================================================');
        console.log('   ✓ Cloudinary Connection & Upload Successful!');
        console.log('====================================================');
        console.log('   Status:              Success (200 OK)');
        console.log('   Secure URL:         ', result.secure_url);
        console.log('   Public ID:          ', result.public_id);
        console.log('   Format / Type:      ', `${result.format} (${result.resource_type})`);
        console.log('   Dimensions:         ', `${result.width}x${result.height}`);
        console.log('   File Size:          ', `${(result.bytes / 1024).toFixed(2)} KB`);

        // 3. Test AI Auto-Tagging (Google Tagging)
        console.log('\n3. Testing Google Auto-Tagging Feature...');
        try {
            const aiResult = await cloudinary.uploader.upload(SAMPLE_IMAGE_URL, {
                folder: 'test_uploads',
                resource_type: 'auto',
                categorization: 'google_tagging',
                auto_tagging: 0.6,
            });

            // Clean up the second image as well
            if (aiResult.public_id) {
                await cloudinary.uploader.destroy(aiResult.public_id);
            }

            const googleData = aiResult.info?.categorization?.google_tagging?.data;
            const tags = aiResult.tags || [];

            if (googleData && googleData.length > 0) {
                console.log('   ✓ Detected AI Tags / Objects:');
                googleData.forEach((item) => {
                    console.log(`     • ${item.tag} (confidence: ${(item.confidence * 100).toFixed(1)}%)`);
                });
            } else if (tags.length > 0) {
                console.log('   ✓ Detected Tags:');
                tags.forEach((tag) => console.log(`     • ${tag}`));
            } else {
                console.log('   ℹ️  Auto-tagging executed without tag output.');
            }
        } catch (aiError) {
            console.log('   ⚠️  Google Auto-Tagging Note:');
            console.log('     ', aiError.message);
            if (aiError.message?.includes('subscription')) {
                console.log('\n   👉 Tip to enable Google Auto-Tagging:');
                console.log('      Go to Cloudinary Console > Add-ons > "Google Auto Tagging"');
                console.log('      Click "Subscribe to Free Plan" (50 free taggings/month).');
            }
        }

    } catch (error) {
        console.error('\n❌ Cloudinary Upload Failed:');
        console.error('   ', error.message || error);
    } finally {
        // 4. Delete the test image from Cloudinary
        if (uploadedPublicId) {
            console.log('\n4. Cleaning up test image from Cloudinary...');
            try {
                const deleteResult = await cloudinary.uploader.destroy(uploadedPublicId);
                console.log('   ✓ Deleted Public ID: ', uploadedPublicId);
                console.log('   ✓ Cleanup Status:    ', deleteResult.result === 'ok' ? 'Success (Deleted)' : deleteResult.result);
            } catch (delError) {
                console.warn('   ⚠️ Could not delete test file:', delError.message);
            }
        }

        console.log('\n====================================================');
        console.log('   Test Execution Finished');
        console.log('====================================================\n');
    }
}

testCloudinary();
