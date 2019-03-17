// function request(url) {
//     const xhr = new XMLHttpRequest();

//     xhr.open('POST', url);

//     // xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
//     xhr.setRequestHeader(
//         'Content-type',
//         'application/x-www-form-urlencoded; charset=utf-8',
//     );
//     xhr.setRequestHeader('X-Custom-Header', 'I am zby');

//     xhr.onreadystatechange = function() {
//         if (xhr.readyState === 4) {
//             console.log('xhr', typeof xhr.response, xhr.response);
//         }
//     };

//     xhr.onerror = e => {
//         console.log('Error', e);
//     };

//     // send 仅用于post请求
//     // 如果是get请求+formData, 不会有任何request payload，也不会解析formData的内容到query parmas中
//     xhr.send(
//         JSON.stringify({
//             text: 'haha',
//         }),
//     );
// }

// request('http://127.0.0.1:8080/people.json');
// request('http://127.0.0.1:8080/people.json?id=1&name=zby');
const form = document.forms[0];
form.addEventListener('submit', event => {
    // 只要用了FormData，就会变成multipart的形式，即使Content-Type', 'application/x-www-form-urlencoded
    let forms = new FormData();
    forms.append('uname', 'test');
    forms.append('psd', 123456);
    forms.append(
        'myFile',
        document.querySelector('input[name="myFile"]').files[0],
    );

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if ((xhr.status >= 200 && xhr.status <= 300) || xhr.status == 304) {
                console.log(xhr.response);
            }
        } else {
            console.log(xhr.status);
        }
    };
    xhr.open('POST', 'http://127.0.0.1:8080/people.json', true);
    // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); //formdata数据请求头需设置为application/x-www-form-urlencoded
    xhr.setRequestHeader('X-Custom-Header', 'I am zby');
    xhr.setRequestHeader('Content-Type', 'multipart/form-data'); //formdata数据请求头需设置为application/x-www-form-urlencoded

    xhr.send(forms);
    // xhr.send('name=zby&language=chinese');
    event.preventDefault();
});
