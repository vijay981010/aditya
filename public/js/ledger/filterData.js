filterData() //GET TOTAL DATA

$('#client').change(filterData) //GET FILTERED DATA 

function filterData(){
    let clientId = $('#client').val()                

    let ajaxReq = {
        url:`${environment.baseurl}/ledger/filter`,
        method:'GET',
        data:{clientId},
        dataType:'json',
        error: function(xhr, status, error){
            alert('Some unknown error')
            console.log(xhr, status, error)
        },
        success: function(response){
            console.log(response)
            $('#totalOrders').val(response.totalOrders)
            $('#billedOrders').val(response.billedOrders)
            $('#totalReceivables').val(response.totalReceivables)
            $('#amountReceived').val(response.amountReceived)
            $('#amountPending').val(response.amountPending)
        }
    }

    $.ajax(ajaxReq)
}