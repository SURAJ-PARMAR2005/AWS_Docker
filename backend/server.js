import express from "express";
import {createServer} from "http";
import { Server } from "socket.io";
import {YSocketIO} from "y-socket.io/dist/server";

const app = express();
app.use(express.static("public"));
const httpServer = createServer(app);

//now create a io server responsible for two way communication

const io = new Server(httpServer,{
    cors : {
        origin:"*",
        methods:["GET","POST"]
    }
})


//now comes the ySocketIo provided by Yjs which handle CRDT by itself


const ySocketIO = new YSocketIO(io)
ySocketIO.initialize();


//below are health check routes which are used to check the health of the server , mostly used on dashboards etc


app.get('/health',(req,res) => {
    res.status(200).json({
        message : "ok",
        success:true,
    })
})

httpServer.listen(3000,() => {
    console.log("Server is running on port 3000");
})

