// Script để sửa lỗi trùng index trong collection orders
// Sử dụng ES modules syntax
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Lấy connection string từ biến môi trường
const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
    console.error('MONGO_URI environment variable is not defined');
    process.exit(1);
}

async function fixIndexes() {
  try {
    // Kết nối MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Lấy collection
    const db = mongoose.connection.db;
    const collection = db.collection('orders');

    // Liệt kê các indexes
    console.log('Current indexes:');
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Tìm và xóa index lỗi
    for (const index of indexes) {
      if (index.key && index.key.orderNumber === 1) {
        console.log('Found problematic index:', index.name);
        try {
            await collection.dropIndex(index.name);
            console.log('Dropped index:', index.name);
        } catch (err) {
            console.error('Error dropping index:', err.message);
        }
      }
    }

    // Kiểm tra lại indexes sau khi xóa
    console.log('Indexes after fix:');
    const newIndexes = await collection.indexes();
    console.log(JSON.stringify(newIndexes, null, 2));
    
    console.log('Index fixed successfully');
  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    // Đóng kết nối
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
    process.exit(0);
  }
}

fixIndexes(); 