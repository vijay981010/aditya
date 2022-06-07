$(document).ready(function(){      
    let p = window.location.pathname      
    let navArr = ['dashboard', 'users', 'orders', 'services', 'manifest', 'invoices', 'ledger','profile', 'settings', 'bills']

    navArr.forEach(navItem => {
        if(p.indexOf(navItem) != -1) $(`#${navItem}`).toggleClass('active')        
    })    
})