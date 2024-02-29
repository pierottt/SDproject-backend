const express = require('express');
const dotenv = require('dotenv');
const cookieParser=require('cookie-parser');
const connectDB= require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helemt = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit=require('express-rate-limit');
const hpp=require('hpp');
const cors=require('cors');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');


dotenv.config({path:'./config/config.env'});

connectDB();

const cars=require('./routes/cars');
const auth =require('./routes/auth')
const rents=require('./routes/rents');

const app=express();

//Body parser
app.use(express.json());

//swagger
const swaggerOptions={
    swaggerDefinition: {
        openapi: '3.0.0',
        info : {
            title :'Library API',
            version :'1.0.0',
            description :'A simple Express VacQ API'
        }
    },
    apis :['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//Cookie parser
app.use(cookieParser());

//Sanitize data
app.use(mongoSanitize());

//Set security helmet
app.use(helemt());

//Prevent XSS attacks
app.use(xss());

//Rate Limiting
const limiter = rateLimit({
    windowMs: 10*60*1000, //10mins
    max:500
});
app.use(limiter);

//Prevent http param pollutions
app.use(hpp());

//Enable CORS
app.use(cors());

app.use('/api/v1/cars',cars)
app.use('/api/v1/auth',auth)
app.use('/api/v1/rents',rents);

const PORT=process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ',process.env.NODE_ENV, ' mode on port ',PORT));

process.on(`unhandledRejection`,(err,promise) => {
    console.log(`Error: ${err.message}`);

    server.close(() => process.exit(1));
});