
document.getElementById('brand-form').addEventListener('submit',async(e)=>{
    try {
      e.preventDefault();
      const formdata=new FormData();
      formdata.append('name',document.getElementById('name').value.trim());
      const response=await fetch('/brands',{
        method:'post',
        body:formdata
      })
      const resbody=await response.json();
      if(resbody.success){
        Swal.fire({
          position: "top-center",
          icon: "success",
          title: "New category has been saved",
          showConfirmButton: false,
          timer: 1500
        });
        setTimeout(() => {
          location.href='/brands'
        }, 500);
      }else{
        document.getElementById('show-error').innerHTML=`
        <div class="alert alert-dismissible fade show alert-danger alert-danger" role="alert">
           <button class="btn-close" type="button" data-bs-dismiss="alert" aria-label="close"></button>
           <strong>${resbody.message}</strong>
         </div>`
      }
    } catch (error) {
      console.log(error)
    }
  })

  //
  
  function deleteBrand(id) {
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
                  fetch(`/brands/delete/${id}`, { method: 'delete' }).then((response) => {
                      if (!response.ok) {
                          console.log('there is an error...')
                          throw new Error('Network response was not ok');
                      }
                      return response.json();
                  }).then((resbody) => {
                      if (resbody.success) {

                          Swal.fire({
                              title: "Deleted!",
                              text: "Your brand has been deleted.",
                              icon: "success"
                          });
                          setTimeout(() => {
                              location.reload()
                          }, 1000);
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