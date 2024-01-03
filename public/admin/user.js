function blockUser(id) {
  try {
    Swal.fire({
      title: "Are you sure?",
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Block user!"
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/users/block/${id}`, { method: 'get' }).then((response) => {
          return response.json()
        }).then((resBody) => {
          if (resBody.success) {
            setTimeout(() => {
              location.reload();
            }, 1000);
            Swal.fire({
              title: "Blocked!",
              text: "User has been Blocked.",
              icon: "success"
            });
          }
        })

      }
    });
  } catch (error) {
    console.log(error)
  }
}
function UnblockUser(id) {
  try {
    Swal.fire({
      title: "Are you sure?",
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Unblock user!"
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/users/unblock/${id}`, { method: 'get' }).then((response) => {
          return response.json()
        }).then((resBody) => {
          if (resBody.success) {
            setTimeout(() => {
              location.reload();
            }, 1000);
            Swal.fire({
              title: "Unblocked!",
              text: "User has been Unblocked.",
              icon: "success"
            });
          }
        })

      }
    });
  } catch (error) {
    console.log(error)
  }
}