
const cors = require('cors');
const {mongoConection} = require('../database/dbConnection.js');
const router = require('./modules/index');
const ejs = require('ejs');
const path = require('path');

module.exports.startApp = async(app, express) => {

    mongoConection();

    app.use(cors());
    app.use(express.json());
    
    // Set EJS as the templating engine
    app.set('view engine', 'ejs');

    // Set the directory for your views
    app.set('views', path.join(__dirname, 'views'));

    // app.use((req, res, next) => {
    //     if(req.originalUrl === "/Order/Webhook") {
    //         return next();
    //     }
    //     express.json()(req,res,next)
    // })

    app.use(router.authRouter);


    app.use((error, req, res, next) => {
        const statusCode = error.status || 500
        return res.status(statusCode).json({
            sucess: 'False',
            message: error.message, 
            stack: error.stack
        });
    });

    app.all('*', (req, res, next) => {
        return next(new Error("page not Found" , {status: 404}));
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server Running On Port: ${PORT} ..`);
    });
};
