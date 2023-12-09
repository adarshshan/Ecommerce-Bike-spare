document.getElementById('verifyOtpForm').addEventListener('submit', async (e) => {
    try {
        e.preventDefault();
        const otp = document.getElementById('otp').value
        if (!otp) {
            document.getElementById('show-error').innerHTML = `
                <div class="alert alert-dismissible fade show alert-warning" role="alert">
                    <button class="btn-close" type="button" data-bs-dismiss="alert"
                        aria-label="close"></button>
                    <strong>Input Fields must be filled!</strong>
                </div>`
            return;
        }
        const formData = new FormData()
        formData.append('otp', document.getElementById('otp').value);
        formData.append('refferalCode', document.getElementById('refferalCode').value);
        const response = await fetch(`/users/verifyOtp`, {
            method: 'post',
            body: formData
        })
        const resbody = await response.json()
        if (resbody.success) {
            Swal.fire({
                position: "top-center",
                icon: "success",
                title: "Signup successfully completed. Please Login.",
                showConfirmButton: false,
                timer: 1500
            });
            setTimeout(() => {
                location.href = '/users/login';
            }, 800);
        } else {
            document.getElementById('show-error').innerHTML = `
                <div class="alert alert-dismissible fade show alert-warning" role="alert">
                    <button class="btn-close" type="button" data-bs-dismiss="alert"
                        aria-label="close"></button>
                    <strong>${resbody.message}</strong>
                </div>`
        }
    } catch (error) {
        console.log(error)
    }
})