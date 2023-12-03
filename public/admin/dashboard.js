


async function Graph(value) {
    try {
        const response = await fetch(`/dashboard/show-graph/${value}`, { method: 'get' })
        const resbody = await response.json()
        if (resbody.success) {
            document.getElementById('container').innerHTML = '';
            var chart = anychart.line();

            var day = chart.line(resbody.ratio.value);
            if (resbody.ratio.time == 'year') {
                day.name(resbody.ratio.time)
            }
            if (resbody.ratio.time == 'month') {
                day.name(resbody.ratio.time)
            }
            if (resbody.ratio.time == 'week') {
                day.name(resbody.ratio.time)
            }
            if (resbody.ratio.time == 'day') {
                day.name(resbody.ratio.time)
            }

            // add a legend
            chart.legend().enabled(true);

            // add a title
            chart.title("Sales Report");

            // specify where to display the chart
            chart.container("container");

            // draw the resulting chart
            chart.draw();

            chart.yAxis().title("Sales ");
            chart.xAxis().title("Time");

            day.hovered().markers().type("circle").size(8);

        } else {
            alert(resbody.message);
        }
    } catch (error) {
        console.log(error)
    }
}
async function deleteMessage(id) {
    try {
        const response = await fetch(`/dashboard/delete-todo-message/${id}`, { method: 'get' })
        const resBody = await response.json()
        if (resBody.success) {
            let messages = '';
            for (let i = 0; i < resBody.todoMessage.length; i++) {
                messages += `
                <div class="d-flex align-items-center border-bottom py-2">
                    <i class="fa-regular fa-circle-check"></i>
                    <div class="w-100 ms-3">
                        <div class="d-flex w-100 align-items-center justify-content-between">
                        <span>${resBody.todoMessage[i].message}</span>
                        <button onclick="deleteMessage('${resBody.todoMessage[i]._id}')" class="btn btn-sm"><i class="fa fa-times"></i></button>
                        </div>
                    </div>
                </div>`
            }
            document.getElementById('todoList').innerHTML = `
            <div class="d-flex align-items-center justify-content-between mb-4">
                <h6 class="mb-0">To Do List</h6>
            </div>
            <div class="d-flex mb-2">
                <input class="form-control bg-transparent" id="todoMsg" type="text" placeholder="Enter task">
                <button type="button" onclick="toDoList()" class="btn btn-primary ms-2">Add</button>
            </div>
            ${messages}`
        } else {
            alert(resBody.message)
        }
    } catch (error) {
        console.log(error)
    }
}
async function toDoList() {
    try {
        const formData = new FormData();
        formData.append('message', document.getElementById('todoMsg').value);
        const response = await fetch(`/dashboard/to-do-list`, {
            method: 'post',
            body: formData
        })
        const resBody = await response.json();
        if (resBody.success) {
            let messages = '';
            for (let i = 0; i < resBody.todoMessage.length; i++) {
                messages += `
                <div class="d-flex align-items-center border-bottom py-2">
                    <i class="fa-regular fa-circle-check"></i>
                    <div class="w-100 ms-3">
                        <div class="d-flex w-100 align-items-center justify-content-between">
                        <span>${resBody.todoMessage[i].message}</span>
                        <button onclick="deleteMessage('${resBody.todoMessage[i]._id}')" class="btn btn-sm"><i class="fa fa-times"></i></button>
                        </div>
                    </div>
                </div>`
            }
            document.getElementById('todoList').innerHTML = `
            <div class="d-flex align-items-center justify-content-between mb-4">
                <h6 class="mb-0">To Do List</h6>
            </div>
            <div class="d-flex mb-2">
                <input class="form-control bg-transparent" id="todoMsg" type="text" placeholder="Enter task">
                <button type="button" onclick="toDoList()" class="btn btn-primary ms-2">Add</button>
            </div>
            ${messages}`
        }
    } catch (error) {
        console.log(error)
    }
}
async function previousButton() {
    try {
        const table = document.getElementById('orderTable')
        const response = await fetch(`/dashboard/order-pagination/?page=minus`, { method: 'get' })
        const resBody = await response.json()
        if (resBody.success) {
            document.getElementById('pagenumber').innerText = resBody.page
            let order = ``;
            for (let i = 0; i < resBody.paginatedProducts.length; i++) {
                let date = resBody.paginatedProducts[i].date.toString().split('T')[0]
                order += `
        <tr>
            <td> ${date}</td>
           <td>${resBody.paginatedProducts[i].invoice}</td>
           <td>${resBody.paginatedProducts[i].address.addressName}</td>
           <td>${resBody.paginatedProducts[i].totalAmount + resBody.paginatedProducts[i].walletAmount}</td>
           <td>Paid</td>
        </tr>`
            }
            table.innerHTML = `
    <table class="table text-start align-middle table-bordered table-hover mb-0">
                            <thead>
                                <tr class="text-dark">
                                    <th scope="col">Date</th>
                                    <th scope="col">Invoice</th>
                                    <th scope="col">Customer</th>
                                    <th scope="col">Amount</th>
                                    <th scope="col">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                               ${order}
                            </tbody>
                        </table>`
        }
    } catch (error) {
        console.log(error)
        alert('somthing went wrong when click previouse button');
    }
}
async function nextButton() {
    try {
        const table = document.getElementById('orderTable')
        const response = await fetch(`/dashboard/order-pagination/?page=plus`, { method: 'get' })
        const resBody = await response.json()
        if (resBody.success) {
            document.getElementById('pagenumber').innerText = resBody.page
            let order = ``;
            for (let i = 0; i < resBody.paginatedProducts.length; i++) {
                let date = resBody.paginatedProducts[i].date.toString().split('T')[0]
                order += `
        <tr>
           <td> ${date}</td>
           <td>${resBody.paginatedProducts[i].invoice}</td>
           <td>${resBody.paginatedProducts[i].address.addressName}</td>
           <td>${resBody.paginatedProducts[i].totalAmount + resBody.paginatedProducts[i].walletAmount}</td>
           <td>Paid</td>
        </tr>`
            }
            table.innerHTML = `
    <table class="table text-start align-middle table-bordered table-hover mb-0">
                            <thead>
                                <tr class="text-dark">
                                    <th scope="col">Date</th>
                                    <th scope="col">Invoice</th>
                                    <th scope="col">Customer</th>
                                    <th scope="col">Amount</th>
                                    <th scope="col">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                               ${order}
                            </tbody>
                        </table>`
        }
    } catch (error) {
        console.log(error)
        alert('somthing went wrong when click previouse button');
    }
}

//download
async function downloadInvoice() {
    // Assume you have a function to convert HTML to a Blob
    const containerHtml = document.getElementById('sales-report-container').innerHTML;

    htmlToBlob(containerHtml, function (blob) {
        // Create a download link and trigger the download
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'SalesReport.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

function htmlToBlob(html, callback) {
    html2pdf(html, {
        margin: 10,
        filename: 'SalesReport.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).then(function (pdf) {
        callback(pdf.output('blob'));
    });
}

