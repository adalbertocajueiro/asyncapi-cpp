import { Schema } from "@asyncapi/parser/esm/models/v2/schema";
import { EnumItem, EnumType } from "../models/enum";
import { AttributeType } from "../models/attribute";
import { ClassType } from "../models/class";


export class CppSchemaBuilderVisitor {

    constructor() {
    }

    buildObject(schema: Schema) {
        var node: any
        //se for um enum
        if (schema.enum()) {
            var items = schema.enum()
            node = new EnumType(schema.id(), this.parseEnumValues(items))
        } else if (schema.type() == 'object') {
            //console.log('encontrou classe: ', schema.id(), schema.properties())
            var attributes = this.buildAttributes(schema.properties())
            node = new ClassType(schema.id(), attributes)
        }
        return node
    }

    parseEnumValues(items?: string[]) {
        var enumItems: EnumItem[] = []
        if (items) {
            for (const itemStr of items) {
                var [name, value] = itemStr.split('=')
                enumItems.push(new EnumItem(name.trim(), value.trim()))
            }
        }

        return enumItems
    }

    buildAttributes(properties?: any) {
        var attributes: AttributeType[] = []
        if (properties) {
            for (var [idProp, valueProp] of Object.entries(properties)) {
                //console.log('property: ', idProp, (valueProp as Schema).type())
                var attType = (valueProp as Schema).type()!.toString()
                var att = new AttributeType(idProp, attType)
                if (attType == 'array') {
                    att.itemsType = ((valueProp as Schema).items() as Schema).type()?.toString()
                    att.itemsTypeName = ((valueProp as Schema).items() as Schema).id()
                } else if (attType == 'object') {
                    att.attTypeName = (valueProp as Schema).id()
                }
                attributes.push(att)
            }
        }

        return attributes
    }

}