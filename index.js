const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const path = require('path');
const uuid = require('uuid');

const replaceTemplate = require('./modules/replaceTemplate');

const PORT = 8000, HOST = "127.0.0.1";


//----------- SYNC -------------------------

// const textIn = fs.readFileSync('./txt/input.txt', 'utf8');
// const textOut = `This data from input file: ${textIn}`;
// fs.writeFileSync('./txt/output.txt',textOut);


//----------- ASYNC ------------------------

// const textIn = fs.readFile('./txt/input.txt', 'utf8', (err,data)=>{
//     if (err) {
//         return console.warn(err);
//     } else {
//         fs.writeFileSync('./txt/output.txt', data, (err)=>{
//             if (err) {
//                 return console.warn(err);
//             } else {
//                 console.log('file written!');
//             }
//         });
//     }
// });


//------------ SERVER ----------------------

const tempOverview = fs.readFileSync(`${__dirname}/template/overview.html`, "utf-8");
const tempCard = fs.readFileSync(`${__dirname}/template/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/template/product.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf8');
const dataObj = JSON.parse(data);

const slugs  = dataObj.map(el => slugify(el.productName, { lower : true}));
//console.log(slugs);

const server = http.createServer((req, res)=>{

    const baseURL = 'http://' + req.headers.host + '/';  // http://localhost:{PORT}
    const reqUrl = new URL(req.url,baseURL);
    const id = reqUrl.searchParams.get('id');
    const pathName = reqUrl.pathname;

    if (pathName === '/' || pathName === '/overview') {
        res.writeHead(200, {'Content-type' : 'text/html'});
        const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
        const output = tempOverview.replace('{%PRODUCTS_CARDS%}', cardsHtml)
        res.end(output);
    } else if (pathName === '/product') {
        if (dataObj[id]) {
            const product = dataObj[id];
            res.writeHead(200, {'Content-type' : 'text/html'});
            const output = replaceTemplate(tempProduct, product);
            res.end(output);
        } else {
            res.writeHead(404, {'content-type':'text/html' });
            res.end('<h1>Error - 404</h1><hr><p>Page not found! No such product.</p>');
        }
    } else if (pathName === '/api') {
        res.writeHead(200, {'content-type':'application/json'});
        res.end(data);
    } else {
        res.writeHead(404, {'content-type':'text/html' });
        res.end('<h1>Error - 404</h1><hr><p>Page not found!</p>');
    }
});

server.listen(PORT, HOST, ()=>{
    console.log(`Server ON: listening to port ${PORT}`);
});
