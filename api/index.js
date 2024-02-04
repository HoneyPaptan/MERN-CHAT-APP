const express = require("express")
const dotenv = require("dotenv")
const jwt = require("jsonwebtoken")
dotenv.config()
const cors = require("cors")
const mongoose = require("mongoose")
const mongourl = process.env.MONGO_URI
const cookieParser = require("cookie-parser")
const bcrypt = require("bcryptjs")
const User = require("./models/User")
const ws = require("ws")
const bcryptSalt = bcrypt.genSaltSync(10)

try{
    mongoose.connect(mongourl)

}catch (err){
    if (err) throw err
}
const jwtSecret = process.env.JWT_SECRET
const app = express()
app.use(express.json())
app.use(cookieParser())
//cors
app.use(cors({
    credentials:true,
    origin:process.env.CLIENT_URL,
}))

app.get('/', (req,res)=>{
    res.json("test ok")

})

app.get("/profile", (req,res) =>{
    const token = req.cookies?.token;

    if(token){
        jwt.verify(token, jwtSecret, {}, (err, userData)=>{
            if (err) throw err
    
    
            res.json(userData)
    
        })
    }
    else{
        res.status(401).json("npo token sent")
    }
        

})

app.post('/login', async(req,res) =>{
    const {username, password} = req.body;
    const foundUser = await User.findOne({username})
    if(foundUser){
        const passOk= bcrypt.compareSync(password, foundUser.password)
        if (passOk){
            jwt.sign({userId: foundUser._id,username}, jwtSecret, {}, (err, token) => {
                res.cookie("token", token,{sameSite:'none', secure:true}).json({
                    id: foundUser._id,
                })
            })
        }
    }

})
 
app.post("/register", async(req,res)=>{
    const {username, password} = req.body

    try {

        const hashedPassword = bcrypt.hashSync(password, bcryptSalt)
        const createdUser = await User.create({
            username: username,

            password:hashedPassword,
        })
        jwt.sign({userId: createdUser._id,username},jwtSecret ,{},  (err, token) =>{
            if (err) throw err;
            res.cookie("token", token, {sameSite:'none', secure:true}).status(201).json({
            id: createdUser._id,
       
            
            })
        } )
        
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyValue) {
            res.status(400).json({ message: "Username already exists" });
        } else {
            // Handle other errors
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
})

const server = app.listen(4000)

const wss = new ws.WebSocketServer({server})

wss.on('connection', (connection , req) =>{
    const cookies = req.headers.cookie;

    if (cookies){
        const tokenCookieString= cookies.split(';').find(str=> str.startsWith("token="));
        
        if (tokenCookieString){
            const token  = tokenCookieString.split("=")[1]
            if(token){
                jwt.verify(token, jwtSecret, {}, (err, userData)=>{
                    if(err) throw err;
                    const {userId, username} = userData;
                    connection.userId = userId;
                    connection.username = username;
                })
            }
        }
    }

    [...wss.clients].forEach(client => {
        client.send(JSON.stringify({
            online: [...wss.clients].map(c => ({userId: c.userId, username: c.username}))
        }
           
        ))
    } )
    
})