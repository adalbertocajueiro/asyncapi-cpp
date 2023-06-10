import { TopicType } from "../models/topic";


export class CppChannelGeneratorVisitor {

    topicNames:string[] = []

    constructor() {
    }

    generateInclude() {
        var result = '#include "metainfo.cpp"\n'
        result = result.concat('#include "mosquitto.h"\n')
        result = result.concat('#include <iostream>\n')
        
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
            if(!this.contains(topicName)){
                this.topicNames.push(topicName)
            }
            
            result = result.concat('std::string ' + topicName + ' = ')
            result = result.concat('"' + (node as TopicType).topicName + '";\n')
        }
        return result
    }

    generateCommunicationLayer(){
        var result = ''
        result = result.concat('#include "topics.cpp"')
        result = result.concat('\n\n')
        result = result.concat('int publish_message(std::string topic, const char *buf)')
        result = result.concat('\n{\n')

        result = result.concat('  char *payload = (char *)buf;\n')
        result = result.concat('  int rc = mosquitto_publish(mosq, NULL, topic.c_str(), strlen(payload), payload, 1, false);\n')
        result = result.concat('  return rc;\n')
        result = result.concat('\n}')
        result = result.concat('\n\n')
        result = result.concat('class CommunicationLayer')
        result = result.concat('\n{\n')
        result = result.concat('public:')
        result = result.concat('\n')
        this.topicNames.forEach(topic => {
            var methodName = 'virtual void handle_' + topic.toLowerCase() + '(const struct mosquitto_message *message) = 0;'
            result = result.concat('  ' + methodName + '\n')
        })
        result = result.concat('};')

        return result
    }

    generateCommunicationLayerImpl(){

        var result = ''
        result = result.concat('#include "communication-layer.cpp"')
        result = result.concat('\n\n')
        
        result = result.concat('class CommunicationLayerImpl: public CommunicationLayer')
        result = result.concat('\n{\n')
        result = result.concat('public:')
        result = result.concat('\n')
        console.log('TOPICS: ', this.topicNames)
        this.topicNames.forEach(topic => {
            var methodName = 'void handle_' + topic.toLowerCase() + '(const struct mosquitto_message *message)'
            result = result.concat('  ' + methodName + '\n')
            result = result.concat('  {\n')
            result = result.concat('    //TODO implement your business code\n')
            result = result.concat('    std::cout << "handle_' + topic.toLowerCase() + '" << std::endl;\n')
            result = result.concat('  }\n')
        })
        result = result.concat('};')

        result = result.concat('\n\n')
        result = result.concat('CommunicationLayerImpl impl;')
        result = result.concat('\n\n')

        //add message callback code
        result = result.concat('void message_callback(struct mosquitto *mosq, void *obj, const struct mosquitto_message *message)\n')
        result = result.concat('{\n')
        for( const [i,topic] of this.topicNames.entries()){
            if( i == 0) {
                result = result.concat('  if (std::strcmp(message->topic,' + topic + '.c_str()) == 0)\n')
                result = result.concat('  {\n')
                result = result.concat('    impl.handle_' + topic.toLowerCase() + '(message);\n')
                result = result.concat('  }\n')
            } else {
                result = result.concat('  else if (std::strcmp(message->topic,' + topic + '.c_str()) == 0)\n')
                result = result.concat('  {\n')
                result = result.concat('    impl.handle_' + topic.toLowerCase() + '(message);\n')
                result = result.concat('  }\n')
            }
        }
        result = result.concat('}')

        return result
        
    }

    contains(topic:string){
        return this.topicNames.find( t => t == topic) != undefined
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