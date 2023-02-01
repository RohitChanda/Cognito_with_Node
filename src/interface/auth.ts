export interface CognitoSignupPayload {
    email:string, 
    firstName: string, 
    lastName: string, 
    designation:string
}

export interface AddUserINGroupPayload {
    groupName:string,
    userName:string
}