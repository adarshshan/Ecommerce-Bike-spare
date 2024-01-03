const stars = document.querySelectorAll('.star');
const current_rating = document.querySelector('.current-rating');
let current_star
stars.forEach((star, index) => {
    star.addEventListener('click', () => {

        current_star = index + 1;
        current_rating.innerText = `${current_star} of 5`;

        stars.forEach((star, i) => {
            if (current_star >= i + 1) {
                star.innerHTML = '&#9733;';
            } else {
                star.innerHTML = '&#9734;';
            }
        });
    });
});
async function validateReview() {
    try {
        const score = current_star;
        const description = document.getElementById('description').value
        const title = document.getElementById('title').value
        const productId = document.getElementById('productId').value
        const username = document.getElementById('username').value
        if (!score || !description || !title || !productId || !username) {
            document.getElementById('errormsg').innerText = `Input Fields must not be Blank.`
        } else {
            document.getElementById('errormsg').innerText = ``
            await reviewSend();
        }
    } catch (error) {
        console.log(error)
    }
}
async function reviewSend() {
    try {
        const score = current_star;
        const description = document.getElementById('description').value
        const title = document.getElementById('title').value
        const productId = document.getElementById('productId').value
        const username = document.getElementById('username').value
        let data = JSON.stringify({
            title: title,
            description: description,
            score: score,
            productId: productId,
            username: username
        })
        const response = await fetch('/carts/review', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: data,
        })
        const resBody = await response.json()
        if (resBody.success) {
            Swal.fire({
                position: "top-center",
                icon: "success",
                title: "Review has been send",
                showConfirmButton: false,
                timer: 1500
            });
        } else {
            // alert('somthing went wrong')
            // alert(resBody.message)
            console.log(resBody.message);
        }
    } catch (error) {
        console.log(error)
    }
}