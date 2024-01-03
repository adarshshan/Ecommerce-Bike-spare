document.getElementById('verifyforgotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData()
    formData.append('otp', document.getElementById('number').value);
    const response = await fetch(`/verifyForgot`, {
        method: 'post',
        body: formData
    })
    const resBody = await response.json()
    if (resBody.success) {
        if (localStorage.getItem('otpTimerRemaining')) localStorage.removeItem('otpTimerRemaining');
        Swal.fire("Email verified successfully!", "success", "success");
        setTimeout(() => {
            location.href = '/newpassword-page'
        }, 1000);
    } else {
        document.getElementById('error-show').innerHTML = `
                <div class="alert alert-dismissible fade show alert-warning" role="alert">
                    <button class="btn-close" type="button" data-bs-dismiss="alert"
                                    aria-label="close"></button>
                    <strong>${resBody.message}</strong>
                </div>`
    }
})