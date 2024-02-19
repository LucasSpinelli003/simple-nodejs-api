import { FastifyReply, FastifyRequest } from "fastify"

export async function checkSessionIdExists(request: FastifyRequest, response:FastifyReply) {
    const sessionId = request.cookies.session_id

    if(!sessionId){
        return response.status(401).send({
            error:"Unauthorized.",
        })
    }
}