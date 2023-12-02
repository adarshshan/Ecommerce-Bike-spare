async function deleteBanner(id) {
    try {
        const response = await fetch(`/banners/delete-banner/${id}`, { method: 'get' })
        const resbody = await response.json()
        if (resbody.success) {
            location.reload()
        } else {
            alert(resbody.message)
        }
    } catch (error) {
        console.log(error)
    }
}
async function deactivateBanner(id) {
    try {
        const response = await fetch(`/banners/deactivate-banner/${id}`, { method: 'get' })
        const resbody = await response.json()
        if (resbody.success) {
            location.reload()
        } else {
            alert(resbody.message)
        }
    } catch (error) {
        console.log(error)
    }
}
async function ActivateBanner(id) {
    try {
        const response = await fetch(`/banners/activate-banner/${id}`, { method: 'get' })
        const resbody = await response.json()
        if (resbody.success) {
            location.reload()
        } else {
            alert(resbody.message)
        }
    } catch (error) {
        console.log(error)
    }
}

//add banner

const input = document.getElementById('inputImage');
const image = document.getElementById('croppedImage');
let cropper;

input.addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            image.src = event.target.result;
            if (cropper) {
                cropper.destroy();
            }
            cropper = new Cropper(image, {
                aspectRatio: 25 / 9,
            });
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('bannerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('product', document.getElementById('product').value);
    formData.append('startDate', document.getElementById('startDate').value);
    formData.append('endDate', document.getElementById('endDate').value);
    formData.append('description', document.getElementById('description').value);

    const canvas = cropper.getCroppedCanvas();
    canvas.toBlob((blob) => {
        formData.append('image', blob, 'cropped_image.jpg');

        fetch('/banners', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error uploading banner');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    console.log('Banner added successfully:', data);
                    location.href = '/banners'
                } else {
                    alert(data.message)
                    location.href = '/banners'
                }

            })
            .catch(error => {
                console.error('Error:', error.message);
            });
    }, 'image/jpeg');
});


