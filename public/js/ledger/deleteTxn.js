
$(document).on('click', '.deleteTxn', function(){
    let txnId = $(this).attr('data-id')
    let url = `${environment.baseurl}/ledger/${txnId}/delete`
    let msg = 'Transaction deleted'
    sendAlert(url, msg)
})

