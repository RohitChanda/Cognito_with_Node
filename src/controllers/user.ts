import { Request, Response} from 'express'
import { CognitoSignupPayload} from '../interface/auth'
import { createGroup, newPasswordRequired, SignUp, UserLogin, validateAccessToken } from '../cognito/cognito'

export async function addUserInCognito(req:Request,res:Response) {
    try {
        const { email, first_name, last_name, designation } = req.body
        const payload: CognitoSignupPayload = {
            email       : email, 
            firstName   : first_name, 
            lastName    : last_name, 
            designation : designation
        }
        const result = await SignUp(payload)
        res.status(200).json({
            response: result,
            message: "User added in cognito"
        })
    } catch (error:any) {
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
}

export async function userLogin(req:Request,res:Response) {
    try {
        const { email, password } = req.body
        const payload = {
            email:email,
            password:password
        }
        const result:any = await UserLogin(payload)
        if( result.ChallengeName == 'NEW_PASSWORD_REQUIRED' ) {
            res.status(200).json({
                ChallengeName:result.ChallengeName,
                session: result.Session,
                message: "SET NEW PASSWORD"
            })
        }
        res.status(200).json({
            response: result,
            message: "User logged in successfully"
        })
    } catch (error:any) {
        res.status(500).json({
            message: error.message
        });
    }
}

export async function newPasswordRequiredForLogin(req:Request,res:Response){
    try {
        const { email, new_password, session } = req.body
        const payload = {
            email : email, 
            newPassword:new_password,
            session : session
        }
        
        const result = await newPasswordRequired(payload)
        
        res.status(200).json({
            response: result,
            message: "User logged in successfully"
        })

    } catch (error: any) {
        console.log(error);
        res.status(500).json({
            message:error.message
        });
    }
}

export async function accesstokenValidation(req:Request,res:Response) {
    try {
        const { token } = req.body
        const result = await validateAccessToken(token)
        res.status(200).json({
            //response: result,
            message: "token validation successfull"
        })
    } catch (error) {
        res.status(500).json({
            message: error
        });
    }
}

