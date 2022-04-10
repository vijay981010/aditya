$(document).ready(function(){      
    let p = window.location.pathname      
    let navArr = ['dashboard', 'users', 'orders', 'services', 'manifest', 'invoices', 'trackings']

    navArr.forEach(navItem => {
        if(p.indexOf(navItem) != -1) $(`#${navItem}`).toggleClass('active')        
    })

    /* if(navItem == 'orders'){
        if(p.indexOf(navItem) != -1 && p.indexOf('archive') == -1) $(`#${navItem}`).toggleClass('active')    
    }else{
         if(p.indexOf(navItem) != -1){
            $(`#${navItem}`).toggleClass('active')
         }                 
    } */
    
})