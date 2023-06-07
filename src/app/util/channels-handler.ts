import { ChannelInterface, SchemaInterface } from "@asyncapi/parser";
import { Channels } from "@asyncapi/parser/esm/models/v2/channels";
import { TopicType } from "../models/topic";
import { CppChannelBuilderVisitor } from "../visitors/CppChannelBuilderVisitor";
import { CppChannelGeneratorVisitor } from "../visitors/CppChannelGeneratorVisitor";

export class ChannelsHandler {

    channels: Channels
    topicsNodes: any[] = []

    channelBuilder?: CppChannelBuilderVisitor
    channelGenerator?: CppChannelGeneratorVisitor

    constructor(channels: Channels) {
        this.channels = channels
        this.channelBuilder = new CppChannelBuilderVisitor()
        this.buildChannelNodes()
        console.log('topics', this.topicsNodes)
        this.channelGenerator = new CppChannelGeneratorVisitor()
    }

    buildChannelNodes() {
        this.channels.forEach(channel => {
            this.topicsNodes.push(this.channelBuilder?.buildNode(channel))
        })
    }

    buildTopics() {

        var result = this.channelGenerator?.generateInclude()
        result = result?.concat(this.channelGenerator?.generateVariables()!)
        this.topicsNodes.forEach(topic => {
            result = result!.concat(this.channelGenerator?.generateTopicsDeclaration(topic)!)
        })

        result = result?.concat(this.buildSubscribeAllTopics())

        return result
    }

    buildSubscribeAllTopics() {
        var result = ''

        result = result.concat('\n\n' + 'void subscribe_all_topics()' + '\n')
        result = result.concat('{\n')

        this.channelGenerator?.topicNames.forEach(topic => {
            result = result!.concat('  mosquitto_subscribe(mosq,NULL,' + topic + '.c_str(),0);\n')
        })

        result = result.concat('\n')
        result = result.concat('  std::cout << "Subscribed on topics: " << std::endl\n')
        for (const [i,topic] of this.channelGenerator!.topicNames.entries()){
            result = result!.concat('    << "  " + ' + topic + '<< std::endl')
            if (i == this.channelGenerator!.topicNames.length - 1){
                result = result.concat(';\n')
            } else {
                result = result.concat('\n')
            }
        }
        
        result = result.concat('\n}')
        return result
        
    }
}