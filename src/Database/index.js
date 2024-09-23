import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstances = await mongoose.connect(
      `${process.env.MONGO_DB_URL}/${process.env.DB_NAME}`
    ); // we need to pass database url and database name
    console.log(
      `DATABASE Connection succesfull with ${process.env.DB_NAME} !! DB_HOST:${connectionInstances.connection.host}`
    );
    // console.log("this is to read ->" + connectionInstances)
  } catch (error) {
    console.log(`Error in Connectin DataBase: + ${error}`);
    process.exit(1);
  }
};

export default connectDB;
