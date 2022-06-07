
$(document).on('click', '.deleteBill', function(){
    let billId = $(this).attr('data-id')
    let url = `${environment.baseurl}/bills/${billId}/delete`
    let msg = 'Bill deleted'
    sendAlert(url, msg)
})

