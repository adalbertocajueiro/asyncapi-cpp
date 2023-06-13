import { identifierName } from "@angular/compiler";
import { TopicType } from "../models/topic";
import { indent, newLine } from "../util/functions";


export class CppChannelGeneratorVisitor {

    topicNames:string[] = []

    generateInclude() {
        var result = '#include "metainfo.cpp"' + newLine()
        result = result.concat('#include "mosquitto.h"' + newLine())
        result = result.concat('#include <iostream>' + newLine())
        
        return result
    }

    generateVariables() {
        var result = newLine()
        result = result.concat('struct mosquitto *mosq;' + newLine(2))
        return result
    }

    generateTopicsDeclaration(node: any) {
        var className = node.constructor.name
        var result: string = ''
        if (className == TopicType.name) {
            var topicName = (node as TopicType).topicName.toUpperCase().replaceAll('/', '_') + '_TOPIC'
            if(!this.contains(topicName)){
                this.topicNames.push(topicName)
            }
            
            result = result.concat('std::string ' + topicName + ' = ')
            result = result.concat('"' + (node as TopicType).topicName + '";' + newLine())
        }
        return result
    }

    generateCommunicationLayer(){
        var result = ''
        result = result.concat('#include "topics.cpp"')
        result = result.concat(newLine(2))
        result = result.concat('int publish_message(std::string topic, const char *buf)')
        result = result.concat(newLine() + '{' + newLine())

        result = result.concat(indent(2) + 'char *payload = (char *)buf;' + newLine())
        result = result.concat(indent(2) + 'int rc = mosquitto_publish(mosq, NULL, topic.c_str(), strlen(payload), payload, 1, false);' + newLine())
        result = result.concat(indent(2) + 'return rc;' + newLine())
        result = result.concat(newLine()  + '}')
        result = result.concat(newLine(2))
        result = result.concat('class CommunicationLayer')
        result = result.concat(newLine() + '{' + newLine())
        result = result.concat('public:')
        result = result.concat(newLine())
        this.topicNames.forEach(topic => {
            var methodName = 'virtual void handle_' + topic.toLowerCase() + '(const struct mosquitto_message *message) = 0;'
            result = result.concat('  ' + methodName + newLine())
        })
        result = result.concat('};')

        return result
    }

    generateCommunicationLayerImpl(){

        var result = ''
        result = result.concat('#include "communication-layer.cpp"')
        result = result.concat(newLine(2))
        
        result = result.concat('class CommunicationLayerImpl: public CommunicationLayer')
        result = result.concat(newLine() + '{' + newLine())
        result = result.concat('public:')
        result = result.concat(newLine())
        this.topicNames.forEach(topic => {
            var methodName = 'void handle_' + topic.toLowerCase() + '(const struct mosquitto_message *message)'
            result = result.concat(indent(2) + methodName + newLine())
            result = result.concat(indent(2) + '{' + newLine())
            result = result.concat(indent(4) + '//TODO implement your business code' + newLine())
            result = result.concat(indent(4) + 'std::cout << "handle_' + topic.toLowerCase() + '" << std::endl;' + newLine())
            result = result.concat(indent(2) + '}' + newLine())
        })
        result = result.concat('};')

        result = result.concat(newLine(2))
        result = result.concat('CommunicationLayerImpl impl;')
        result = result.concat(newLine(2))

        //add message callback code
        result = result.concat('void message_callback(struct mosquitto *mosq, void *obj, const struct mosquitto_message *message)' + newLine())
        result = result.concat('{' + newLine())
        for( const [i,topic] of this.topicNames.entries()){
            if( i == 0) {
                result = result.concat(indent(2) + 'if (std::strcmp(message->topic,' + topic + '.c_str()) == 0)' + newLine())
                result = result.concat(indent(2) + '{' + newLine())
                result = result.concat(indent(4) + 'impl.handle_' + topic.toLowerCase() + '(message);' + newLine())
                result = result.concat(indent(2) + '}' + newLine())
            } else {
                result = result.concat(indent(2) + 'else if (std::strcmp(message->topic,' + topic + '.c_str()) == 0)' + newLine())
                result = result.concat(indent(2) + '{' + newLine())
                result = result.concat(indent(4) + 'impl.handle_' + topic.toLowerCase() + '(message);' + newLine())
                result = result.concat(indent(2) + '}' + newLine())
            }
        }
        result = result.concat('}')

        return result
        
    }

    contains(topic:string){
        return this.topicNames.find( t => t == topic) != undefined
    }
    
}