import { Channels } from "@asyncapi/parser/esm/models/v2/channels";
import { CppChannelBuilderVisitor } from "../visitors/CppChannelBuilderVisitor";

export class InitialMetainfoHandler {

    initialMetainfoContent:string = ''

    constructor(content:string){
        this.initialMetainfoContent = content
    }

    generateInitialMetainfo(){
        var result = ''

        result = result.concat('#include "generated.cpp"')
        result = result.concat('\n\n')
        result = result.concat(this.initialMetainfoContent)
        result = result.concat('\n')
        
        return result
    }
}