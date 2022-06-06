$('#ledgerExport').on('click', function(){          
    $('#ledgerExportModal').modal('show')
})

$('#closeLedgerExportModal').on('click', function(){
    $('#ledgerExportModal').modal('hide')
})

$('#ledgerExportSubmit').on('click', function(){        
    $('#ledgerExportModal').modal('hide')        
})    