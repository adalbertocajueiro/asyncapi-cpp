import { Operation } from "@asyncapi/parser/esm/old-api/operation"

export class TopicType {
    topicName!:string
    publish?:Operation
    subscribe?:Operation

    constructor(name:string,pub?:any,sub?:any){
        this.topicName = name
        this.publish = pub
        this.subscribe = sub
    }
}