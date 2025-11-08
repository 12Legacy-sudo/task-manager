import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://legacyceo94_db_user:ceolegacy@taskmanagerapp.nq3jjul.mongodb.net/?appName=taskmanagerapp')
     .then(() => console.log('DB CONNECTED'));
} 