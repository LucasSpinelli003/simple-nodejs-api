import { afterAll, beforeAll, it, describe, expect } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'

describe('Transactions routes', () =>{
    beforeAll( async() =>{
        await app.ready()
    })
    afterAll( async() =>{
        await app.close()
    })
    
    
    it('should be able to create a new transaction', async () =>{
    
        await request(app.server)
        .post('/transactions')
        .send({
            title:'newTransaction',
            amount:2.50,
            type:'credit'
        })
        .expect(201)
    })

    it('shoud be able to list all transactions', async () =>{

       const createTransactionResponse =  await request(app.server)
        .post('/transactions')
        .send({
            title:'newTransaction',
            amount:2.50,
            type:'credit'
        })

        const cookie = createTransactionResponse.get('Set-Cookie')

       const listTransactionsResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookie)
        .expect(200)
        
        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title:'newTransaction',
                amount:2.50,
            })
        ])
    })
})
