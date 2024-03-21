// importing dependencies
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const {connectDB} = require("./Config/databaseConfig");
const bodyParser = require("body-parser");
const initUserRoutes = require("./Routes/user.routes");
const syncModels = require("./Config/sync.model");
const { seedServiceCategoryTypes } = require("./Seeders/serviceCategoryType.seeds");
dotenv.config();
const app = express();
const port = process.env.PORT || 8000;
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
console.log("secret " , process.env.JWT_SECRET , process.env.PORT);
// connect server
app.get("/", (req, res) => res.send("server connected! "));

// connecting to db
connectDB()
.then(async () => {
    console.log("db is connected");
    await syncModels();
    await seedServiceCategoryTypes();
})
.catch(error => {
    console.log(error , "error in connecting to the database");
})
// init routing 
app.use("/v1", initUserRoutes());

app.listen(port, ()=>{
    console.log(`app is listening on port ${port}`);
});


