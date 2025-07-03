import mongoose from 'mongoose';
import Activity from './models/Activity.js';
import './db/connection.js';

async function createTestActivities() {
    try {
        console.log('Creating test activities...');
        
        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const testUserId = new mongoose.Types.ObjectId('6859edb73c123456789abcde'); // Sample user ID
        const testTargetId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439012');
        
        const activities = [
            {
                user: testUserId,
                type: 'LIKE',
                targetType: 'REPORT',
                target: testTargetId,
                targetModel: 'Report',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
            },
            {
                user: testUserId,
                type: 'COMMENT',
                targetType: 'REPORT',
                target: testTargetId,
                targetModel: 'Report',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12 hours ago
            },
            {
                user: testUserId,
                type: 'DISLIKE',
                targetType: 'CLAIM',
                target: testTargetId,
                targetModel: 'Claim',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
            },
            {
                user: testUserId,
                type: 'REPORT_CREATE',
                targetType: 'REPORT',
                target: testTargetId,
                targetModel: 'Report',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
            }
        ];
        
        await Activity.insertMany(activities);
        console.log('Test activities created successfully!');
        
        // Verify creation
        const count = await Activity.countDocuments({ user: testUserId });
        console.log(`Total activities for test user: ${count}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating test activities:', error);
        process.exit(1);
    }
}

createTestActivities();
