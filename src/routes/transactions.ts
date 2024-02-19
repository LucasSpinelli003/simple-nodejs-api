import { FastifyInstance } from "fastify"
import { z } from "zod" 
import { knex } from "../database"
import { randomUUID } from "crypto"
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"



export async function transactionsRoutes(app: FastifyInstance) {

    app.get(
        "/", 
        {
        preHandler: [checkSessionIdExists]
        } , 
    async (request)=>{

        const sessionId = request.cookies.session_id

        const transactions = await knex('transactions')
        .where("session_id",sessionId)
        .select()

        return { transactions }
    })

    app.get('/:id',
        {
            preHandler: [checkSessionIdExists]
        },
         async (request) => {

            const sessionId = request.cookies.session_id

        const getTransactionParamsSchema = z.object({
            id: z.string().uuid(),
        })
        const { id } = getTransactionParamsSchema.parse(request.params)

        const transaction = await knex('transactions')
        .where({
            session_id: sessionId,
            id
        }).first()

        return { transaction }
    })

    app.get('/summary',
        {
            preHandler: [checkSessionIdExists]
        }, 
        async (request) =>{

          const sessionId = request.cookies.session_id

        const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount',{as: 'amount'})
        .first()

        return { summary }
    })

    app.post('/', async (request, response)=>{

        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit','debit'])
        })

        const {title, amount, type} = createTransactionBodySchema.parse(request.body)
        
        let sessionId = request.cookies.session_id

        if(!sessionId){
            sessionId = randomUUID()
            response.cookie('session_id',sessionId, {
                path:'/',
                maxAge: 60 * 60 * 24 * 7  // 7days
            })
        }

        await knex('transactions')
        .insert({
            id: randomUUID(),
            title,
            amount: type === 'credit'? amount : amount * -1,
            session_id: sessionId
        })
        response.status(201).send()
    })
}