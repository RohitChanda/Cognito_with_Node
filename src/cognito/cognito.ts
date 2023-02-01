import AWS from "../config/aws-sdk"
import * as dotenv from "dotenv"
import { CognitoSignupPayload, AddUserINGroupPayload } from "../interface/auth"
import axios from "axios"
import JWT from 'jsonwebtoken'
import jwkToPem from 'jwk-to-pem'
dotenv.config()

const poolData:{UserPoolId:string, ClientId:string, PoolRegion:string } = {
    UserPoolId : process.env.AWS_COGNITO_USER_POOL_ID as string,
    ClientId   : process.env.AWS_COGNITO_CLIENT_ID as string,
    PoolRegion : process.env.AWS_REGION as string
}

const cognito = new AWS.CognitoIdentityServiceProvider({region: poolData.PoolRegion})

export function SignUp(body:CognitoSignupPayload){
    const { email ,firstName, lastName, designation} = body
    return new Promise((resolve, reject)=>{
        cognito.adminCreateUser({
            UserPoolId: poolData.UserPoolId,
            Username: email,
            DesiredDeliveryMediums: ['EMAIL'],
            //MessageAction: 'SUPPRESS', //stop sending the invitation
            //MessageAction: 'RESET',  // resend the invitation message to a user that already exists 
            // TemporaryPassword: "temp#1234", // If you don't specify a value, Amazon Cognito generates one for you.
            UserAttributes: [
                {
                    Name  : 'email',
                    Value : email
                },
                {
                    Name  : 'given_name',
                    Value : firstName
                },
                {
                    Name  : 'family_name',
                    Value : lastName
                },
                {
                    Name  : 'custom:designation',
                    Value : designation
                },
            ]
        },function(err:any,response){
            if(err){
                // console.log('line 47',err);
                
                reject(err)
            }else{
                resolve(response.User)
            }
        })
    })
}

export function createGroup(groupName:string){
    return new Promise((resolve, reject)=>{
        cognito.createGroup({
            GroupName: groupName,
            UserPoolId: poolData.UserPoolId
        },function(err,response){
            if(err){
                reject(err)
            }else{
                resolve(response)
            }
        })
    })
}

export function addUserIntoGroup( payload:AddUserINGroupPayload ){
    const {groupName, userName} = payload
    return new Promise((resolve, reject)=>{
        cognito.adminAddUserToGroup({
            GroupName: groupName,
            Username: userName,
            UserPoolId: poolData.UserPoolId
        },function(err,response){
            if(err){
                reject(err)
            }else{
                resolve(response)
            }
        })
    })
}

export function UserLogin(payload:{email:string,password:string}){
    const { email, password } = payload
    return new Promise((resolve, reject)=>{
        cognito.adminInitiateAuth({
            AuthFlow: 'ADMIN_NO_SRP_AUTH',
            ClientId: poolData.ClientId,
            UserPoolId: poolData.UserPoolId,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        },function(err,response){
            if(err){
               reject(err)
               return
            }
            
            resolve(response)
            
        })
    })
}

export async function newPasswordRequired(payload:{email:string, newPassword:string, session:string}){
    const { email, newPassword, session } = payload
    return new Promise((resolve, reject)=>{
        cognito.adminRespondToAuthChallenge({
            ChallengeName: 'NEW_PASSWORD_REQUIRED',
            ClientId: poolData.ClientId,
            UserPoolId: poolData.UserPoolId,
            ChallengeResponses: {
              USERNAME: email,
              NEW_PASSWORD: newPassword,
            },
            Session: session
          },function(err,response){
            if(err){
                reject(err)
            }else{
                resolve(response)
            }
        })
    })
}

export  function validateAccessToken(token:string) {
    return new Promise((resolve, reject) => {
        axios.get(`https://cognito-idp.${poolData.PoolRegion}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`, {headers: {'Content-Type': 'application/json'}})
        .then((response)=>{
            const body = response.data
            const pem = jwkToPem(body.keys[1])
        
            JWT.verify(token, pem, function(err:any, payload:any) {
                if(err) {
                    reject(err.message)
                } else {
                    resolve(payload)
                }
            })
        })
        .catch((err)=>{
            console.log(err);
            reject(err)
        })
    })
}