import { afterAll, beforeAll, it, describe, expect } from 'vitest'
import { execSync } from 'child_process'
import { app } from '../src/app'
import request from 'supertest'
import { beforeEach } from 'node:test'

describe('Transactions routes', () =>{
    beforeAll( async() =>{
        await app.ready()
    })
    afterAll( async() =>{
        await app.close()
    })
    beforeEach(() =>{
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')

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

    it('shoud be able to get a specific transaction', async () =>{

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
    

         const transactionId = listTransactionsResponse.body.transactions[0].id

         const getSpecificTransaction = await request(app.server)
         .get(`/transactions/${transactionId}`)
         .set('Cookie', cookie)


         expect(getSpecificTransaction.body.transaction).toEqual(
             expect.objectContaining({
                title:'newTransaction',
                amount:2.50,
             })
         )
     })

     it('shoud be able to get summary of transactions', async () =>{

        const createCreditTransactionResponse =  await request(app.server)
         .post('/transactions')
         .send({
             title:'creditTransaction',
             amount:5000,
             type:'credit'
         })
         const cookie = createCreditTransactionResponse.get('Set-Cookie')

            await request(app.server)
         .post('/transactions')
         .set('Cookie', cookie)
         .send({
             title:'debitTransaction',
             amount:2000,
             type:'debit'
         })
 
 
        const summaryTransactionsResponse = await request(app.server)
         .get('/transactions/summary')
         .set('Cookie', cookie)
         .expect(200)
         
         expect(summaryTransactionsResponse.body.summary).toEqual(
             expect.objectContaining({
                 amount:3000
             })
         )
     })
})
