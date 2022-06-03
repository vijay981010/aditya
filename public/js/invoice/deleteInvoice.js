
$(document).on('click', '.deleteInvoice', function(){
    let invoiceId = $(this).attr('data-id')
    let url = `${environment.baseurl}/invoices/${invoiceId}/delete`
    let msg = 'Invoice deleted'
    sendAlert(url, msg)
})

