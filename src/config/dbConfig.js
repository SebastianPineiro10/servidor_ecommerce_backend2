// src/config/dbConfig.js
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://sebastian_bienesraices:Sebastian10@cluster0.86qdn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Atlas conectado correctamente');
  } catch (error) {
    console.error('Error al conectar a MongoDB Atlas:', error.message);
    process.exit(1);
  }
};
