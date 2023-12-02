const input = document.getElementById('inputImage');
const image = document.getElementById('croppedImage');
const existImage = document.getElementById('image')
let cropper;
existImage.addEventListener('click', (e) => {
    existImage.style.width = '700px'
    if (cropper) {
        cropper.destroy()
    }
    cropper = new Cropper(existImage, {
        aspectRatio: 25 / 9,
    })

})
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
    formData.append('id', document.getElementById('id').value);
    formData.append('product', document.getElementById('product').value);
    formData.append('startDate', document.getElementById('startDate').value);
    formData.append('endDate', document.getElementById('endDate').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('sameimage', document.getElementById('sameimage').value);


    const canvas = cropper.getCroppedCanvas();
    canvas.toBlob((blob) => {
        formData.append('image', blob, 'cropped_image.jpg');

        fetch('/banners/update-banner', {
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