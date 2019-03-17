const http = require('http');
const URL = require('url');
const path = require('path');
const querystring = require('querystring');
const fs = require('fs');

const filesArr = [];
const dirsArr = [];

const mimeMap = {
    html: 'text/html',
    js: 'text/javascript',
    css: 'text/css',
    txt: 'text/plain',
    json: 'application/json',
    application: {
        gif: 'image/gif',
        png: 'image/png',
        jpeg: 'image/jpeg',
        bmp: 'image/bmp',
        // 二进制文件没有特定或已知的 subtype，即使用 application/octet-stream。
        ico: ' application/octet-stream',
        xml: 'application/xml',
        pdf: 'application/pdf',
        audio: {
            midi: 'audio/midi',
            mpeg: 'audio/mpeg',
            webm: 'audio/webm',
            ogg: 'audio/ogg',
            wav: 'audio/wav',
        },
        video: {
            webm: 'video/webm',
            ogg: 'video/ogg',
        },
    },
};

http
    .createServer(function(request, response) {
        const urlObj = URL.parse(request.url);
        const pathname = querystring.unescape(urlObj.pathname);
        const getData = querystring.parse(urlObj.query);
        // console.log('getData', getData);
        const arr = pathname.split('.');
        const ext = arr[1];
        const pathArr = pathname.split('/');
        const filePath = `${__dirname}${pathname}`;
        if (ext) {
            switch (ext) {
                case 'json':
                    response.setHeader(
                        'Access-Control-Allow-Origin',
                        // 'http://localhost:8081, http://127.0.0.1:8081',
                        'http://127.0.0.1:8081',
                    );
                    response.setHeader(
                        'Access-Control-Allow-Headers',
                        'content-type, X-Custom-Header',
                    );

                    // response.setHeader('Content-Type', 'application/json');

                    //创建空字符叠加数据片段
                    let data = '';
                    let post = {}; //普通数据
                    let files = {}; // 文本数据
                    //2.注册data事件接收数据（每当收到一段表单提交的数据，该方法会执行一次）
                    request.on('data', function(chunk) {
                        // chunk 默认是一个二进制数据，和 data 拼接会自动 toString
                        // <Buffer 2d ... >
                        console.log('chunk', chunk);
                        data += chunk;
                    });

                    // 3.当接收表单提交的数据完毕之后，就可以进一步处理了
                    //注册end事件，所有数据接收完成会执行一次该方法
                    request.on('end', function() {
                        // name=zby&language=chinese
                        console.log('data', data);
                        //（1）.对url进行解码（url会对中文进行编码）
                        data = decodeURI(data);

                        // 如果是以multi-data提交
                        data.replace(
                            /form-data;\s*(\S*)?\r\n\r\n(\S*)\r\n/gi,
                            function(match, p1, p2) {
                                console.log('match', match, p1, p2);
                                post[JSON.parse(p1.split('=')[1])] = p2;
                            },
                        );
                        console.log('post', post);

                        // 如果是以www-form-urlencoded提交 { name: 'zby', language: 'chinese' }
                        // const dataObject = querystring.parse(data);
                        // console.log('dataObject', dataObject);
                        // multipart/form-data

                        // response.setHeader(
                        //     'Access-Control-Allow-Methods',
                        //     'OPTIONS, DELETE',
                        // );

                        // response.setHeader(
                        //     'Access-Control-Allow-Credentials',
                        //     'true',
                        // );
                        response.writeHead(200);
                        response.end(
                            JSON.stringify({
                                name: 'zby',
                                birth: '1993-7-9',
                            }),
                        );
                    });
                    break;

                case 'html':
                case 'txt':
                case 'js':
                case 'css':
                    fs.readFile(filePath, 'utf-8', function(err, data) {
                        if (err) throw err;

                        response.setHeader(
                            'Content-Type',
                            `${mimeMap[ext]}; charset=utf-8`,
                        );
                        response.setHeader('Access-Control-Max-Age', '3600');
                        response.writeHead(200);
                        response.write(data);
                        response.end('done');
                    });
                    break;
                case mimeMap.application[ext].split('/')[1]:
                    const stats = fs.statSync(filePath);
                    response.setHeader(
                        'Content-Type',
                        'application/octet-stream',
                    );

                    response.setHeader(
                        'Content-Disposition',
                        `attachment; filename=${querystring.escape(
                            pathArr[pathArr.length - 1],
                        )}`,
                    );

                    response.setHeader('Content-Length', stats.size);

                    // createReadStream是返回一个读取流，response是响应头，pipe是将两个数据流连接起来。
                    fs.createReadStream(filePath).pipe(response);

                    break;
                default:
                    response.writeHead(200);
                    response.end('done');
                    break;
            }
        } else {
            const appRoot = __dirname;
            const dirPath = `${appRoot}${pathname}`;

            fs.readdir(dirPath, (err, files) => {
                if (err) throw err;

                const promises = files.map(function(filename) {
                    let htmlStr;
                    const thePathName =
                        pathname === '/' ? pathname : `${pathname}/`;

                    const href = `http://127.0.0.1:8080${thePathName}${filename}`;

                    return new Promise(function(resolve, reject) {
                        fs.stat(path.join(dirPath, filename), function(
                            eror,
                            stats,
                        ) {
                            if (stats.isFile()) {
                                filesArr.push(filename);
                                htmlStr = `
                                <div>
                                    <a href="${href}">
                                        我是文件${filename}
                                    </a>
                                </div>`;

                                resolve(htmlStr);
                            } else if (stats.isDirectory()) {
                                dirsArr.push(filename);
                                htmlStr = `
                                <div>
                                    <a href="${href}">
                                        我是目录${filename}
                                    </a>
                                </div>
                            `;

                                resolve(htmlStr);
                            }
                        });
                    });
                }, null);

                Promise.all(promises).then(function(res) {
                    response.setHeader(
                        'Content-Type',
                        'text/html; charset=utf-8',
                    );
                    response.writeHead(200);
                    response.write(res.join(''));
                    response.end('done');
                });
            });
        }
    })
    .listen(8080);

console.log('Server running at http://127.0.0.1:8080/');
