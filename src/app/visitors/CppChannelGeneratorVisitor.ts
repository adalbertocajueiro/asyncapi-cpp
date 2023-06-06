import { TopicType } from "../models/topic";


export class CppChannelGeneratorVisitor {

    constructor() {
    }

    generateInclude() {
        var result = '#include "metainfo.cpp"\n\n'

        return result
    }

    generateVariables(){
        var result = '\n\n'
        result = result.concat('struct mosquitto *mosq;\n\n')
        return result
    }

    generateDeclaration(node: any) {
        var className = node.constructor.name
        var result: string = ''
        if (className == TopicType.name) {
            result = result.concat('std::string ' + (node as TopicType).topicName.toUpperCase().replaceAll('/', '_') + '_TOPIC = ')
            result = result.concat('"' + (node as TopicType).topicName + '";\n')
        }
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