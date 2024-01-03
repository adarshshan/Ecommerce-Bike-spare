document.getElementById('edit-product').addEventListener('submit', async (e) => {
  try {
    e.preventDefault();
    const formData = new FormData()
    formData.append('name', document.getElementById('name').value.trim())
    formData.append('brandId', document.getElementById('brandId').value);
    formData.append('categorieId', document.getElementById('categorieId').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('stock', document.getElementById('stock').value);
    formData.append('discount', document.getElementById('discount').value);
    formData.append('description', document.getElementById('description').value.trim());
    const imageInput = document.getElementById('image');
    if (imageInput.files.length > 0) {
      for (let i = 0; i < imageInput.files.length; i++) {
        const validImage = await validateImageFile(imageInput.files[i]);
        if (!validImage) return Swal.fire("Invalid image file detected", "", "info");
        formData.append('image', imageInput.files[i]);
      }
    }
    const id = document.getElementById('productId').value;
    const response = await fetch(`/products/update/${id}`, {
      method: 'post',
      body: formData
    })
    const resbody = await response.json()
    if (resbody.success) {
      Swal.fire({
        position: "top-center",
        icon: "success",
        title: "Product has been updated",
        showConfirmButton: false,
        timer: 1500
      });
      setTimeout(() => {
        location.href = '/products';
      }, 500);
    } else {
      document.getElementById('show-error').innerHTML = `
        <div class="alert alert-dismissible fade show alert-warning" role="alert">
          <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
          <strong>${resbody.message}</strong>
        </div>`
    }
  } catch (error) {
    console.log(error);
  }
})
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