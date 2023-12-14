document.getElementById('product-form').addEventListener('submit', async (e) => {
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
      console.log('Input images are ...')
      console.log(imageInput.files)
      if (imageInput.files.length > 0) {
        for (let i = 0; i < imageInput.files.length; i++) {
          const validImage = await validateImageFile(imageInput.files[i]);
          if (!validImage) return Swal.fire({
            title: "",
            text: "Invalid Image Detected!.\n Choose the valid Images",
            icon: "error"
          });
          formData.append('image', imageInput.files[i]);
        }
      }

      const response = await fetch(`/products`, {
        method: 'post',
        body: formData
      })
      const resbody = await response.json()
      if (resbody.success) {
        Swal.fire({
          position: "top-center",
          icon: "success",
          title: "New Product has been saved",
          showConfirmButton: false,
          timer: 1500
        });
        setTimeout(() => {
          location.href = '/products';
        }, 500);
      } else {
        document.getElementById('error-show').innerHTML = `
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

  //Delete products
  function deleteProduct(id) {
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(`/products/delete/${id}`, { method: 'delete' }).then((response) => {
            if (!response.ok) {
              console.log('there is an error...')
              throw new Error('Network response was not ok');
            }
            return response.json();
          }).then((resbody) => {
            if (resbody.success) {
              Swal.fire({
                title: "Deleted!",
                text: "Your Product has been deleted.",
                icon: "success"
              });
              setTimeout(() => {
                location.href='/products'
              }, 500);
            } else {
              alert('oops')
              Swal.fire({
                title: "oops!",
                text: `${resbody.message}`,
                icon: "failure"
              });
            }
          }).catch((err) => {
            console.log(err)
            alert(err)
          })


        }
      });
    } catch (error) {
      console.log(error)
    }
  }

  