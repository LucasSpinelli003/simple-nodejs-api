import { FastifyInstance } from "fastify"
import { z } from "zod" 
import { knex } from "../database"
import { randomUUID } from "crypto"


export async function transactionsRoutes(app: FastifyInstance) {
    app.post('/', async (request, response)=>{

        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit','debit'])
        })

        const {title, amount, type} = createTransactionBodySchema.parse(request.body)
        

        await knex('transactions')
        .insert({
            id: randomUUID(),
            title: title,
            amount: type === 'credit'? amount : amount * -1,
        })
        response.status(201).send()
    })

    app.post("/", async ()=>{
        const transactions = await knex('transactions')
        .select('*')

        return transactions
    })
}