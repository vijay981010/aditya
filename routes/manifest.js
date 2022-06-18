const { Router } = require('express')
const router = Router()
const {manifestList, manifestForm, manifestGenerate,
    manifestUpdateForm, manifestUpdate, manifestExcel, ediExcel} = require('../controllers/manifestController')
const {verifyToken, authorizeRole, authorizeResource, authorizeModule} = require('../helpers/helpers')

let admin = ['admin', 'superadmin']

router.get('/list', verifyToken, authorizeRole(admin), authorizeModule('manifest'), manifestList)  

router.get('/', verifyToken, authorizeRole(admin), authorizeModule('manifest'), manifestForm)  

router.post('/', verifyToken, authorizeRole(admin), manifestGenerate)  

router.get('/:manifestId', verifyToken, authorizeRole(admin), authorizeResource, manifestUpdateForm)  

router.put('/:manifestId', verifyToken, authorizeRole(admin), authorizeResource, manifestUpdate)  



router.get('/:manifestId/manifestexcel', verifyToken, authorizeRole(admin), authorizeResource, manifestExcel)  

router.get('/:manifestId/ediexcel', verifyToken, authorizeRole(admin), authorizeResource, ediExcel)  


module.exports = router