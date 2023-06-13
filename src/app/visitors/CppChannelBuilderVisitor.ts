import { TopicType } from "../models/topic";
import { ChannelInterface, OperationInterface } from "@asyncapi/parser";
import { AsyncOperation, OperationType } from "../models/operation";


export class CppChannelBuilderVisitor {

    buildNode(channel: ChannelInterface) {
        var operations = channel.operations()
        var topic:any 
        if(operations){
            var pubOp = this.buildOperationNode(OperationType.PUBLISH, operations[0])
            var subOp = this.buildOperationNode(OperationType.SUBSCRIBE, operations[1])

            topic = new TopicType(channel.id(), pubOp, subOp)
        }
        

        return topic
    }

    buildOperationNode(opType: OperationType, operation:OperationInterface){
        var result:any
        var opId = operation.id()
        var messages = operation.messages()
        if(messages){
            var message = messages[0]
            result = new AsyncOperation(opType,opId,message.payload())
        }
        

        return result
    }
}