import { Schema } from "@asyncapi/parser/esm/models/v2/schema"

export enum OperationType {
    PUBLISH,SUBSCRIBE
}

export class AsyncOperation {
    operationType!:OperationType
    operationName!:string
    payload?:Schema

    constructor(opType:OperationType, opName:string, pld?:Schema){
        this.operationType = opType
        this.operationName = opName
        this.payload = pld
    }
}