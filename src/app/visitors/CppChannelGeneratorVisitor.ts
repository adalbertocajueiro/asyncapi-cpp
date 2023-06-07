import { TopicType } from "../models/topic";


export class CppChannelGeneratorVisitor {

    topicNames:string[] = []

    constructor() {
    }

    generateInclude() {
        var result = '#include "metainfo.cpp"\n'
        result = result.concat('#include "mosquitto.h"\n')
        return result
    }

    generateVariables() {
        var result = '\n'
        result = result.concat('struct mosquitto *mosq;\n\n')
        return result
    }

    generateTopicsDeclaration(node: any) {
        var className = node.constructor.name
        var result: string = ''
        if (className == TopicType.name) {
            var topicName = (node as TopicType).topicName.toUpperCase().replaceAll('/', '_') + '_TOPIC'
            this.topicNames.push(topicName)
            result = result.concat('std::string ' + topicName + ' = ')
            result = result.concat('"' + (node as TopicType).topicName + '";\n')
        }
        return result
    }

    generateCommunicationLayer(){
        var result = ''
        
        return result
    }

    visitNode(node: any) {
        var className = node.constructor.name
        var result: string = ''
        if (className == TopicType.name) {
            //result = this.visitTopic(node)
        }
        return result
    }

    visitTopicNode(node: TopicType) {

    }
}