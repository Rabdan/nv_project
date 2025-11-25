const mongoose = require('mongoose');
const User = require('./models/User');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nvision');
        console.log('Connected to MongoDB for seeding');

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ username: 'admin' });

        if (existingAdmin) {
            console.log('Admin user already exists, skipping seed');
            await mongoose.connection.close();
            return;
        }

        // Create admin user
        const adminUser = new User({
            username: 'admin',
            password: 'admin123', // Will be hashed by pre-save hook
            role: 'admin',
            sessions: []
        });

        await adminUser.save();
        console.log('✅ Admin user created successfully');
        console.log('   Username: admin');
        console.log('   Password: admin123');

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run seed if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
