import { Request, Response} from 'express'
import { AddUserINGroupPayload} from '../interface/auth'
import { createGroup,addUserIntoGroup } from '../cognito/cognito'

export async function createGroupinCognito(req:Request,res:Response) {
    try {
        const { group_name } = req.body
        const result = await createGroup(group_name)
        //console.log(result)
        res.status(200).json({
            response: result,
            message: "Group added in cognito"
        });
    } catch (error:any) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
}

export async function addUserInCognitoGroup(req:Request,res:Response) {
    try {
        const {user_email, group_name} = req.body
        const payload: AddUserINGroupPayload = {
            groupName : group_name,
            userName  : user_email
        }
        const result = await addUserIntoGroup(payload)
        res.status(200).json({
            response: result,
            message: "user added to group"
        });
    } catch (error:any) {
        res.status(500).json({
            message: error.message
        });
    }
}