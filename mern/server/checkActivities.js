import './db/connection.js';
import Activity from './models/Activity.js';

async function checkActivities() {
    try {
        console.log('Checking activities...');
        const count = await Activity.countDocuments();
        console.log('Total activities:', count);
        
        if (count > 0) {
            const sample = await Activity.findOne().populate('user', 'username').lean();
            console.log('Sample activity:', JSON.stringify(sample, null, 2));
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

setTimeout(checkActivities, 2000); // Wait for DB connection
