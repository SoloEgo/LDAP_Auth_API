const express = require("express");
const json = require("express");
const urlencoded = require("express");
const cors = require("cors");
const db = require("./models");
const dbConfig = require("./config/db.config");

db.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log('Successfully connect to MongoDB.');
}).catch(err=>{
    console.log(`Connection error ${err}`);
    process.exit();
})

const app = express();

var corsOptions = {
    origin: "http://localhost:8081"
};

//add cors
app.use(cors(corsOptions));

//parse request which contains json
app.use(json());

// parse x-www-form-urlencoded
app.use(urlencoded({extended: true}));

app.get("/", (req,res)=>{
    res.json({message: "API APP application run successfully"});
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, ()=>{
    console.log(`Server is running on port: ${PORT}`);
})

require('./routes/auth.routes')(app);