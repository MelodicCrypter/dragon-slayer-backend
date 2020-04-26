import Mongoose from 'mongoose';

// Mongoose Settings
// Atlas MongoDB: If deploying don't forget to whitelist IP
Mongoose.Promise = global.Promise;
Mongoose.connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
})
    .then(() => console.log('🤩❤️ Connection, successful!'))
    .catch(e => console.log('🤯 Connection, unsuccessful!', e));

export default Mongoose;
