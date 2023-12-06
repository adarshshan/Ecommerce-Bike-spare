document.addEventListener("DOMContentLoaded", function () {
    const scrollStep = 150; // Adjust as needed
    const categoryItems = document.getElementById("category-items")
    const scrollLeftBtn = document.getElementById('scroll-left')
    const scrollRightBtn = document.getElementById('scroll-right')

    scrollLeftBtn.addEventListener('click', function () {
        categoryItems.scrollLeft -= scrollStep;
    });

    scrollRightBtn.addEventListener('click', function () {
        const availableScroll = categoryItems.scrollWidth - categoryItems.clientWidth;
        const currentPosition = categoryItems.scrollLeft;

        if (currentPosition < availableScroll) {
            const nextScroll = currentPosition + scrollStep;
            categoryItems.scrollLeft = nextScroll < availableScroll ? nextScroll : availableScroll;
        }
    });
});




async function addToCart(data) {
    const productDetails = JSON.parse(data);
    const response = await fetch(`/carts/add/${productDetails.id}/${productDetails.name}/${productDetails.price}/${productDetails.image}/${productDetails.description}`, { method: 'get' })
    const resBody = await response.json()
    if (resBody.success) {
        localStorage.removeItem('CouponDetails')
    } else {
        // alert(resBody.message)
        location.href = '/carts'
    }
}

async function addToWishlist(id) {
    const response = await fetch(`/add-wishlist/${id}`, { method: 'get' })
    const resBody = await response.json()
    if (resBody.success) {
        document.getElementById(`heart${id}`).style.color = 'red'
    }
}


//-------forgotpage.ejs-------//
async function getOtp() {
    try {
        const email = document.getElementById('email').value
        const response = await fetch(`/forgotPassword/${email}`)
        const resBody = await response.json()
        if (resBody.success) {
            console.log(resBody.message)
            location = '/verifyForgot';
            // document.getElementById('bttn').innerHTML=`<a href="/verifyForgot" class="btn btn-success">Continue</a>`
        } else {
            console.log(resBody.message)
            document.getElementById('message').innerHTML = `
            <div class="alert alert-dismissible fade show alert-warning" role="alert">
            <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
             <strong>${resBody.message}</strong>
            </div>`
        }
    } catch (error) {
        console.log(error)
    }

}

//------newpassword.ejs---------//

// Alert Popup
function openPopup() {
    popup.classList.add('open-popup');
}
function closePopup() {
    popup.classList.remove('open-popup');
}

async function newPass() {
    const password = document.getElementById('password').value
    const cpassword = document.getElementById('cpassword').value
    const response = await fetch(`/newpassword/${password}/${cpassword}`, { method: 'get' })
    const resBody = await response.json()
    if (resBody.success) {
        console.log(resBody.message)
        openPopup()
        document.getElementById('inner').innerHTML = `
                <div class="col-md-12">
                    <h1>CREATED NEW PASSWORD</h1>
                    <a class="btn btn-primary p-2" href="/users/login">Sign In</a>
                </div>`
    } else {
        console.log(resBody.message)
        document.getElementById('message').innerHTML = `
    <div class="alert alert-dismissible fade show alert-danger" role="alert" id="message">
        <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
             <strong>${resBody.message}</strong>
    </div>`
    }
}

//productDetails.ejs

async function buyNow(data) {
    const productDetails = JSON.parse(data);
    const response = await fetch(`/carts/buy-now/${productDetails.id}/${productDetails.name}/${productDetails.price}/${productDetails.image}/${productDetails.description}/${productDetails.discount}`, { method: 'get' })
    const resBody = await response.json()
    if (resBody.success) {
        console.log(resBody.message)
        localStorage.removeItem('CouponDetails')
        location.href = '/users/checkout'
    } else {
        alert(`Somthing went wrong at buyNow`);
    }
}
async function addToCart(data) {
    const productDetails = JSON.parse(data);
    const response = await fetch(`/carts/add/${productDetails.id}/${productDetails.name}/${productDetails.price}/${productDetails.image}/${productDetails.description}`, { method: 'get' })
    const resBody = await response.json()
    if (resBody.success) {
        localStorage.removeItem('CouponDetails')
        location.href = '/carts';
    } else {
        // alert(resBody.message)
        location.href = '/carts'
    }
}


$(document).ready(function () {
    $('.thumbnail-item').click(function () {
        // Remove the "active" class from all thumbnail items
        $('.thumbnail-item').removeClass('active');

        // Add the "active" class to the clicked thumbnail
        $(this).addClass('active');

        // Get the index of the clicked thumbnail
        let index = $(this).index();

        // Activate the corresponding carousel item
        $('#productCarousel').carousel(index);
    });

    $(".carousel-item").mousemove(function (e) {
        var img = $(".zoom_img");
        var offset = $(this).offset();
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;
        var mouseX = (x / $(this).width()) * 100;
        var mouseY = (y / $(this).height()) * 100;

        img.css({
            "transform-origin": mouseX + "% " + mouseY + "%",
            "transform": "scale(3)" // Adjust the scale as needed
        });
    });

    $(".carousel-item").mouseleave(function () {
        $(".zoom_img").css({
            "transform-origin": "center",
            "transform": "scale(1)"
        });
    });
});