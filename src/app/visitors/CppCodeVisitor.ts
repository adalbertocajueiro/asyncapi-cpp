

import { AttributeType } from '../models/attribute'
import { ClassType } from '../models/class'
import { EnumItem, EnumType } from '../models/enum'
import { DEFAULT_VALUES_MAP, TYPES_MAP } from '../util/basic-defs'

export var IDENT_LEVEL:number  = 0

export function visitNode(node:any){
    var className = node.constructor.name
    var result:string = ''
    if (className == EnumType.name){
        result = visitEnum(node)
    } else if (className == ClassType.name){
        result = visitClass(node)
    }
    //console.log('TYPE: ', node.constructor.name, typeof(node))

    return result
}

export function formatEnum(enumObj: EnumType) {
    return visitEnum(enumObj)
}

function visitEnum(enumObj:EnumType):string{
    var result:string = ''
    var identLevel = 0
    result = result.concat('enum ')
    result = result.concat(enumObj.name)
    result = result.concat(' {')
    result = result.concat(' \n')
    identLevel = 2
    for(let i = 0; i < enumObj.items.length; i++){
        var item:EnumItem = enumObj.items[i]
        result = result.concat(getSpaces(identLevel))
        result = result.concat(visitEnumItem(item))
        if (i < enumObj.items.length - 1){
            result = result.concat(', ')  
        }
        result = result.concat('\n')
    }
    result = result.concat('};')

    return result
}

function isNumeric(value:any) {
    return /^-?\d+$/.test(value) && !isNaN(parseInt(value));
}

function visitEnumItem(item:EnumItem):string {
    var result: string = ''

    result = result.concat(item.name)
    if(item.value){
        //tries to detect if value is string or number
        if(isNumeric(item.value)){
            result = result.concat(' = ')
            result = result.concat(item.value)
        } else { //em C enum só pode ser associado a inteiro
            throw new TypeError("Value is not a valid number")
        }
    }
    return result
}

function getSpaces(n:number){
    return Array.from({ length: n }, () => ' ').join('')
}

function newLine(){
    return '\n'
}

function indent(spaces:number) {
    return getSpaces(spaces)
}

function visitClass(classObj:ClassType){
    var result: string = ''
    var identLevel = 0
    result = result.concat('class ')
    result = result.concat(classObj.className)
    result = result.concat(newLine())
    result = result.concat('{')
    result = result.concat(newLine())
    
    console.log('classobj',classObj)
    result = result.concat('public:')
    result = result.concat(newLine())
    identLevel = 2
    
    for(const att of classObj.attributes){
        result = result.concat(visitAttribute(att,identLevel))
    }
    
    result = result.concat(newLine())
    result = result.concat(buildConstructor(classObj,identLevel))

    result = result.concat(newLine())
    result = result.concat(newLine())
    result = result.concat(buildEqualityOperator(classObj, identLevel))

    result = result.concat(newLine())
    result = result.concat(newLine())
    result = result.concat(buildToJsonOperation(classObj, identLevel))

    result = result.concat(newLine())
    result = result.concat('};')

    return result
}

function visitAttribute(attribute:AttributeType, indentLevel:number){
    var result:string = ''
    var apiType = attribute.attType
    var cppType = TYPES_MAP.get(apiType)!
    result = result.concat(indent(indentLevel))
    result = result.concat(cppType)
    result = result.concat(' ')
    result = result.concat(attribute.attName)
    result = result.concat(';')
    result = result.concat(newLine())

    return result
}

function buildConstructor(classObj:ClassType, indentLevel:number){
    var result: string = ''

    result = result.concat(indent(indentLevel))
    result = result.concat(classObj.className)
    result = result.concat(newLine())
    result = result.concat(indent(indentLevel) + '{')
    result = result.concat(newLine())
    indentLevel = indentLevel + 2
    
    for (const att of classObj.attributes) {
        var defaultValue = DEFAULT_VALUES_MAP.get(att.attType)!
        result = result.concat(indent(indentLevel) +  'this->' + att.attName + ' = ' + defaultValue)

        result = result.concat(newLine())
    }
    indentLevel = indentLevel - 2
    
    result = result.concat(indent(indentLevel) + '}')

    return result
}

function buildEqualityOperator(classObj: ClassType, indentLevel: number){
    var result: string = ''

    result = result.concat(indent(indentLevel))
    result = result.concat('bool operator == (' + classObj.className + ' other)')
    result = result.concat(newLine() + indent(indentLevel) + '{')
    result = result.concat(newLine())
    indentLevel = indentLevel + 2
    result = result.concat(indent(indentLevel)  + 'return')
    result = result.concat(newLine())
    indentLevel = indentLevel + 2

    for (const [index, att] of classObj.attributes.entries()) {
        result = result.concat(indent(indentLevel) + 'this->' + att.attName + ' == other.' + att.attName)
        if (index < classObj.attributes.length - 1){
            result = result.concat('  &&')
        }
        result = result.concat(newLine())
    }
    indentLevel = indentLevel - 2
    indentLevel = indentLevel - 2

    result = result.concat(indent(indentLevel) + '}')

    return result
}

function buildToJsonOperation(classObj: ClassType, indentLevel: number){
    var result: string = ''

    result = result.concat(indent(indentLevel))
    result = result.concat('json to_json()')
    result = result.concat(newLine() + indent(indentLevel) + '{')
    indentLevel = indentLevel + 2
    result = result.concat(newLine() + indent(indentLevel) + 'json result;')
    result = result.concat(newLine())
    for (const [index, att] of classObj.attributes.entries()) {
        //se o tipo do atributo nao necessita conversao entao preenche direto
        result = result.concat(indent(indentLevel) + 'result["' + att.attName + '"] = ' + att.attName)
        result = result.concat(newLine())
    }
    result = result.concat(newLine())

    result = result.concat(indent(indentLevel) + 'return result;')
    indentLevel = indentLevel - 2
    result = result.concat(newLine() + indent(indentLevel) + '}')

    return result
}

/**
 * json to_json()
    {
        json result;

        result["minimum"] = this->minimum;
        result["maximum"] = this->maximum;

        return result;
    }
 */