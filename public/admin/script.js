setCookie = (cName, cValue, expDays) => {
    let date = new Date()
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000))
    const expires = 'expires=' + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + "; path=/"
}

getCookie = (cName) => {
    const name = cName + "=";
    const cDecoded = decodeURIComponent(document.cookie);
    const cArr = cDecoded.split("; ");
    let value;
    cArr.forEach(val => {
        if (val.indexOf(name) === 0) value = val.substring(name.length);
    })
    return value;
}

document.querySelector('#cookies-btn').addEventListener('click', () => {
    document.querySelector('#cookies').style.display = 'none';
    setCookie('cookie', true, 30);
})

cookieMessage = () => {
    if (!getCookie('cookie'))
        document.querySelector("#cookies").style.display = 'block';
}
window.addEventListener('load', cookieMessage);

document.getElementById('admin-login').addEventListener('submit', async (e) => {
    try {
        e.preventDefault();
        const formData = new FormData();
        formData.append('email', document.getElementById('email').value.split(' ').join(''));
        formData.append('password', document.getElementById('password').value)
        const response = await fetch(`/admin/login`, {
            method: 'post',
            body: formData
        })
        const resbody = await response.json()
        if (resbody.success) {
            location.href = '/dashboard';
        } else {
            document.getElementById('admin-login-error').innerHTML = `
            <div class="alert alert-dismissible fade show alert-danger" role="alert">
                         <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
                         <strong>${resbody.message}</strong>
                       </div>`
            console.log(resbody.message)
        }
    } catch (error) {
        console.log(error)
    }
})
