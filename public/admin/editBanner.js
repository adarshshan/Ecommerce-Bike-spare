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
    const validate = validateBanner()
    if (!validate) return 0;
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
                    if (data.err) return location.href = '/err-internal';
                    alert(data.message)
                    location.href = '/banners'
                }

            })
            .catch(error => {
                console.error('Error:', error.message);
            });
    }, 'image/jpeg');
});
async function validateBanner() {
    try {
        const title = document.getElementById('title').value.split(' ').join('')
        const product = document.getElementById('product').value
        const sdate = document.getElementById('startDate').value
        const edate = document.getElementById('endDate').value
        const inputImage=document.getElementById('inputImage')
        const description = document.getElementById('description').value.split(' ').join('')
        const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        document.getElementById('title-error').innerText = ''; document.getElementById('product-error').innerText = '';
        document.getElementById('sdate-error').innerText = ''; document.getElementById('edate-error').innerText = '';
        document.getElementById('description-error').innerText = '';
        const validate=await validateImageFile(inputImage.files[0]);
        if(!validate) return Swal.fire({
            title: "",
            text: "Invalid Image Detected!.\n Choose the valid Images",
            icon: "error"
          });;
        let flag = 0;
        if (specialChars.test(title)) {
            document.getElementById('title-error').innerText = 'Special characters are not accepted!'
            flag = 1;
        }
        if (!title || !product || !sdate || !edate || !description) {
            flag = 1;
            if (!title) document.getElementById('title-error').innerText = '* This field is required.';
            if (!product) document.getElementById('product-error').innerText = '* This field is required!';
            if (!sdate) document.getElementById('sdate-error').innerText = '* This field is required!';
            if (!edate) document.getElementById('edate-error').innerText = '*This field is required!';
            if (!description) document.getElementById('description-error').innerText = '*This field is required!';
        }
        if (flag === 0) return true;
        return false;
    } catch (error) {
        console.log(error)
    }
}
function validateImageFile(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function () {
        // Image is valid if it loads properly
        resolve(true);
      };
      img.onerror = function () {
        // Image failed to load, hence invalid
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  }

flatpickr("#startDate,#endDate", {
    dateFormat: "Y-m-d", // Customize the date format as needed
  });