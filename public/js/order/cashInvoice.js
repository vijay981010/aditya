$('#cashInvoice').on('click', function(){        
    $('#cashInvoiceModal').modal('show')

    let orderId = $(this).data('cashorder')
    $('#cashOrder').val(orderId)

    let client = $(this).data('misc')
    $('#modalMiscClient').val(client)
})

$('#cashInvoiceCloseModal').on('click', function(){
    $('#cashInvoiceModal').modal('hide')
})

$('#cashInvoiceSubmit').on('click', function(){        
    $('#cashInvoiceModal').modal('hide')        
})    