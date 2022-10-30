const request = require('supertest')
const app = require('../../index')
const jwt = require('jsonwebtoken')

test('returns a 201 on successful signup', async () => {
    //SIGNIN AS SUPERADMIN
    process.env.ACCESS_TOKEN_SECRET_KEY = 'whatever'
    let data = { id: '20482034', role: 'superadmin' }
    let token = jwt.sign( data, process.env.ACCESS_TOKEN_SECRET_KEY, {expiresIn : '24h'} )
    
    request(app)
    .post('/users/add')
    .send({
        role: 'admin',
        username: 'new admin',
        password: 'password',        
    })
    .expect(201)
})