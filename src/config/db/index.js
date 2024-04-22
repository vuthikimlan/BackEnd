const  mongoose  = require("mongoose");

async function connect() {
    try {
        await mongoose.connect('mongodb+srv://root:123@atlascluster.2nlnh9o.mongodb.net/KLTN?retryWrites=true&w=majority&appName=AtlasCluster')
        console.log('Connect successfully');
    } catch (error) {
        console.log('Connect failure ');
    }
}

module.exports = {connect}