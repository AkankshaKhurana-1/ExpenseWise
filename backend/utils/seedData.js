const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const { Transaction } = require('../models/Transaction');
const Budget = require('../models/Budget');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expensewise';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing test data for demo user
    const demoEmail = 'demo@expensewise.com';
    let user = await User.findOne({ email: demoEmail });

    if (user) {
      console.log('[Seed] Removing old demo user data...');
      await Transaction.deleteMany({ userId: user._id });
      await Budget.deleteMany({ userId: user._id });
      await User.deleteOne({ _id: user._id });
    }

    // Create demo user
    user = await User.create({
      name: 'Alex Morgan',
      email: demoEmail,
      password: 'password123',
      currency: 'INR',
      theme: 'light'
    });

    console.log(`[Seed] Created Demo User: ${user.email} (Password: password123)`);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    // Helper to generate date
    const getDate = (monthsAgo, day) => {
      const d = new Date(currentYear, currentMonth - monthsAgo, day, 12, 0, 0);
      return d;
    };

    // Realistic transactions spanning last 6 months
    const sampleTransactions = [
      // Current Month (0 months ago)
      { title: 'Monthly Tech Salary', amount: 85000, type: 'income', category: 'Salary', date: getDate(0, 1), description: 'Full-time monthly salary' },
      { title: 'Freelance UI Design', amount: 22000, type: 'income', category: 'Freelance', date: getDate(0, 5), description: 'Client landing page design' },
      { title: 'Apartment Rent', amount: 20000, type: 'expense', category: 'Rent', date: getDate(0, 2), description: 'Monthly flat rent' },
      { title: 'Supermarket Groceries', amount: 5400, type: 'expense', category: 'Food', date: getDate(0, 3), description: 'Weekly groceries from Nature Basket' },
      { title: 'Electricity & Water Bill', amount: 3200, type: 'expense', category: 'Bills', date: getDate(0, 6), description: 'Monthly utility bills' },
      { title: 'Fine Dining with Friends', amount: 2800, type: 'expense', category: 'Food', date: getDate(0, 8), description: 'Weekend dinner at Olive Bistro' },
      { title: 'Winter Wardrobe Shopping', amount: 7200, type: 'expense', category: 'Shopping', date: getDate(0, 10), description: 'Jackets and sneakers' },
      { title: 'Metro & Uber Commutes', amount: 1850, type: 'expense', category: 'Transportation', date: getDate(0, 12), description: 'Weekly transport expenses' },
      { title: 'Netflix & Spotify Subs', amount: 1199, type: 'expense', category: 'Entertainment', date: getDate(0, 14), description: 'Streaming subscriptions' },
      { title: 'Dentist Consultation', amount: 1500, type: 'expense', category: 'Healthcare', date: getDate(0, 15), description: 'Routine dental checkup' },

      // 1 month ago
      { title: 'Monthly Tech Salary', amount: 85000, type: 'income', category: 'Salary', date: getDate(1, 1), description: 'Full-time monthly salary' },
      { title: 'Stock Dividends', amount: 6500, type: 'income', category: 'Investment', date: getDate(1, 10), description: 'Quarterly stock payout' },
      { title: 'Apartment Rent', amount: 20000, type: 'expense', category: 'Rent', date: getDate(1, 2), description: 'Monthly flat rent' },
      { title: 'Grocery Superstore', amount: 7600, type: 'expense', category: 'Food', date: getDate(1, 7), description: 'Monthly kitchen supplies' },
      { title: 'Internet Fiber Bill', amount: 1499, type: 'expense', category: 'Bills', date: getDate(1, 8), description: 'High-speed broadband' },
      { title: 'Weekend Gateway Trip', amount: 12500, type: 'expense', category: 'Travel', date: getDate(1, 16), description: 'Resort stay & fuel' },
      { title: 'Tech Gadget Purchase', amount: 4500, type: 'expense', category: 'Shopping', date: getDate(1, 20), description: 'Ergonomic wireless mouse' },
      { title: 'Online Learning Course', amount: 3500, type: 'expense', category: 'Education', date: getDate(1, 24), description: 'Fullstack advanced certification' },

      // 2 months ago
      { title: 'Monthly Tech Salary', amount: 85000, type: 'income', category: 'Salary', date: getDate(2, 1), description: 'Full-time monthly salary' },
      { title: 'Consulting Advisory', amount: 18000, type: 'income', category: 'Business', date: getDate(2, 12), description: 'Architecture consulting' },
      { title: 'Apartment Rent', amount: 20000, type: 'expense', category: 'Rent', date: getDate(2, 2), description: 'Monthly flat rent' },
      { title: 'Organic Foods & Dairy', amount: 8100, type: 'expense', category: 'Food', date: getDate(2, 9), description: 'Monthly provisions' },
      { title: 'Gym Annual Membership', amount: 14000, type: 'expense', category: 'Healthcare', date: getDate(2, 11), description: 'Fitness center renewal' },
      { title: 'Movie Night & Popcorn', amount: 1600, type: 'expense', category: 'Entertainment', date: getDate(2, 18), description: 'IMAX Cinema' },
      { title: 'Fuel & Car Maintenance', amount: 4200, type: 'expense', category: 'Transportation', date: getDate(2, 22), description: 'Car service' },

      // 3 months ago
      { title: 'Monthly Tech Salary', amount: 82000, type: 'income', category: 'Salary', date: getDate(3, 1), description: 'Full-time monthly salary' },
      { title: 'Freelance Mobile App', amount: 30000, type: 'income', category: 'Freelance', date: getDate(3, 14), description: 'Flutter app milestone' },
      { title: 'Apartment Rent', amount: 20000, type: 'expense', category: 'Rent', date: getDate(3, 2), description: 'Monthly flat rent' },
      { title: 'Groceries & Provisions', amount: 7300, type: 'expense', category: 'Food', date: getDate(3, 8), description: 'Household provisions' },
      { title: 'Mobile Phone Repair', amount: 5000, type: 'expense', category: 'Other', date: getDate(3, 17), description: 'Screen replacement' },
      { title: 'Flight Tickets', amount: 11200, type: 'expense', category: 'Travel', date: getDate(3, 25), description: 'Family holiday flight' },

      // 4 months ago
      { title: 'Monthly Tech Salary', amount: 82000, type: 'income', category: 'Salary', date: getDate(4, 1), description: 'Full-time monthly salary' },
      { title: 'Mutual Fund Gain', amount: 9500, type: 'income', category: 'Investment', date: getDate(4, 15), description: 'Redemption profit' },
      { title: 'Apartment Rent', amount: 20000, type: 'expense', category: 'Rent', date: getDate(4, 2), description: 'Monthly flat rent' },
      { title: 'Food & Dining Out', amount: 6900, type: 'expense', category: 'Food', date: getDate(4, 10), description: 'Dining and takeout' },
      { title: 'Home Decor & Furniture', amount: 8500, type: 'expense', category: 'Shopping', date: getDate(4, 19), description: 'Study table and chair' },
      { title: 'Electricity Bill', amount: 2900, type: 'expense', category: 'Bills', date: getDate(4, 21), description: 'Summer air conditioning bill' },

      // 5 months ago
      { title: 'Monthly Tech Salary', amount: 82000, type: 'income', category: 'Salary', date: getDate(5, 1), description: 'Full-time monthly salary' },
      { title: 'Apartment Rent', amount: 20000, type: 'expense', category: 'Rent', date: getDate(5, 2), description: 'Monthly flat rent' },
      { title: 'Supermarket Groceries', amount: 6800, type: 'expense', category: 'Food', date: getDate(5, 6), description: 'Monthly groceries' },
      { title: 'Fuel & Petrol', amount: 3100, type: 'expense', category: 'Transportation', date: getDate(5, 13), description: 'Commuting fuel' },
      { title: 'Books & Kindle Store', amount: 2100, type: 'expense', category: 'Education', date: getDate(5, 27), description: 'System design books' }
    ];

    const insertedTransactions = await Transaction.insertMany(
      sampleTransactions.map(t => ({ ...t, userId: user._id }))
    );
    console.log(`[Seed] Inserted ${insertedTransactions.length} sample transactions`);

    // Budgets for current month (1-indexed)
    const thisMonth = currentMonth + 1;
    const sampleBudgets = [
      { category: 'Rent', amount: 20000, month: thisMonth, year: currentYear }, // 100% (Rent spent: 20000)
      { category: 'Food', amount: 10000, month: thisMonth, year: currentYear }, // ~82% warning (spent: 8200)
      { category: 'Shopping', amount: 6000, month: thisMonth, year: currentYear }, // >100% exceeded (spent: 7200)
      { category: 'Bills', amount: 5000, month: thisMonth, year: currentYear }, // 64% normal (spent: 3200)
      { category: 'Transportation', amount: 4000, month: thisMonth, year: currentYear }, // 46% normal (spent: 1850)
      { category: 'Entertainment', amount: 3000, month: thisMonth, year: currentYear } // 40% normal (spent: 1199)
    ];

    const insertedBudgets = await Budget.insertMany(
      sampleBudgets.map(b => ({ ...b, userId: user._id }))
    );
    console.log(`[Seed] Inserted ${insertedBudgets.length} budgets for ${thisMonth}/${currentYear}`);

    console.log('[Seed] Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
