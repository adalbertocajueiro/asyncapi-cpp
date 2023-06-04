

import { AttributeType } from '../models/attribute'
import { ClassType } from '../models/class'
import { EnumItem, EnumType } from '../models/enum'
import { DEFAULT_VALUES_MAP, JSON_TYPES_MAP, TYPES_MAP } from '../util/basic-defs'

export class CppCodeVisitor {

    constructor() {
    }

    visitNode(node: any) {
        var className = node.constructor.name
        var result: string = ''
        if (className == EnumType.name) {
            result = visitEnum(node)
        } else if (className == ClassType.name) {
            result = visitClass(node)
        }
        //console.log('TYPE: ', node.constructor.name, typeof(node))

        return result
    }

    visitEnum(enumObj: EnumType): string {
        var result: string = ''
        var identLevel = 0
        result = result.concat('enum ')
        result = result.concat(enumObj.name)
        result = result.concat(' {')
        result = result.concat(' \n')
        identLevel = 2
        for (let i = 0; i < enumObj.items.length; i++) {
            var item: EnumItem = enumObj.items[i]
            result = result.concat(getSpaces(identLevel))
            result = result.concat(visitEnumItem(item))
            if (i < enumObj.items.length - 1) {
                result = result.concat(', ')
            }
            result = result.concat('\n')
        }
        result = result.concat('};')

        return result
    }

    isNumeric(value: any) {
        return /^-?\d+$/.test(value) && !isNaN(parseInt(value));
    }

    visitEnumItem(item: EnumItem): string {
        var result: string = ''

        result = result.concat(item.name)
        if (item.value) {
            //tries to detect if value is string or number
            if (isNumeric(item.value)) {
                result = result.concat(' = ')
                result = result.concat(item.value)
            } else { //em C enum só pode ser associado a inteiro
                throw new TypeError("Value is not a valid number")
            }
        }
        return result
    }

    getSpaces(n: number) {
        return Array.from({ length: n }, () => ' ').join('')
    }

    newLine() {
        return '\n'
    }

    indent(spaces: number) {
        return getSpaces(spaces)
    }

    visitClass(classObj: ClassType) {
        var result: string = ''
        var identLevel = 0
        result = result.concat('class ')
        result = result.concat(classObj.className)
        result = result.concat(newLine())
        result = result.concat('{')
        result = result.concat(newLine())

        console.log('classobj', classObj)
        result = result.concat('public:')
        result = result.concat(newLine())
        identLevel = 2

        for (const att of classObj.attributes) {
            result = result.concat(visitAttribute(att, identLevel))
        }

        result = result.concat(newLine())
        result = result.concat(buildConstructor(classObj, identLevel))

        result = result.concat(newLine())
        result = result.concat(newLine())
        result = result.concat(buildEqualityOperator(classObj, identLevel))

        result = result.concat(newLine())
        result = result.concat(newLine())
        result = result.concat(buildToJsonOperation(classObj, identLevel))

        result = result.concat(newLine())
        result = result.concat(newLine())
        result = result.concat(buildFromJsonOperation(classObj, identLevel))

        result = result.concat(newLine())
        result = result.concat(newLine())
        result = result.concat(buildFromJsonStringOperation(classObj, identLevel))

        result = result.concat(newLine())
        result = result.concat('};')

        return result
    }

    visitAttribute(attribute: AttributeType, indentLevel: number) {
        var result: string = ''
        var apiType = attribute.attType
        var cppType = TYPES_MAP.get(apiType)!
        if (attribute.attType == 'array') {
            cppType = cppType.concat('<' + TYPES_MAP.get(attribute.itemsType!) + '>')
        }
        result = result.concat(indent(indentLevel))
        result = result.concat(cppType)
        result = result.concat(' ')
        result = result.concat(attribute.attName)
        result = result.concat(';')
        result = result.concat(newLine())

        return result
    }

    buildConstructor(classObj: ClassType, indentLevel: number) {
        var result: string = ''

        result = result.concat(indent(indentLevel))
        result = result.concat(classObj.className)
        result = result.concat(newLine())
        result = result.concat(indent(indentLevel) + '{')
        result = result.concat(newLine())
        indentLevel = indentLevel + 2

        for (const att of classObj.attributes) {
            var defaultValue = DEFAULT_VALUES_MAP.get(att.attType)!
            if (att.attType == 'array') {
                defaultValue = defaultValue.concat('<' + TYPES_MAP.get(att.itemsType!) + '>()')
            }
            result = result.concat(indent(indentLevel) + 'this->' + att.attName + ' = ' + defaultValue + ';')

            result = result.concat(newLine())
        }
        indentLevel = indentLevel - 2

        result = result.concat(indent(indentLevel) + '}')

        return result
    }

    buildEqualityOperator(classObj: ClassType, indentLevel: number) {
        var result: string = ''

        result = result.concat(indent(indentLevel))
        result = result.concat('bool operator == (' + classObj.className + ' other)')
        result = result.concat(newLine() + indent(indentLevel) + '{')
        result = result.concat(newLine())
        indentLevel = indentLevel + 2
        result = result.concat(indent(indentLevel) + 'return')
        result = result.concat(newLine())
        indentLevel = indentLevel + 2

        for (const [index, att] of classObj.attributes.entries()) {
            //if the attributes are string then we must compare them with strcmp
            //for example strcmp(this->id.c_str(), other.id.c_str()) == 0;
            if (att.attType == 'string') {
                result = result.concat(indent(indentLevel) + 'strcmp(this->' + att.attName + '.c_str()' + ', ' + 'other.' + att.attName + '.c_str()) == 0;')
            } else {
                result = result.concat(indent(indentLevel) + 'this->' + att.attName + ' == other.' + att.attName)
            }

            if (index < classObj.attributes.length - 1) {
                result = result.concat('  &&')
            }
            result = result.concat(newLine())
        }
        indentLevel = indentLevel - 2
        indentLevel = indentLevel - 2

        result = result.concat(indent(indentLevel) + '}')

        return result
    }

    buildToJsonOperation(classObj: ClassType, indentLevel: number) {
        var result: string = ''

        result = result.concat(indent(indentLevel))
        result = result.concat('json to_json()')
        result = result.concat(newLine() + indent(indentLevel) + '{')
        indentLevel = indentLevel + 2
        result = result.concat(newLine() + indent(indentLevel) + 'json result;')
        result = result.concat(newLine())
        for (const [index, att] of classObj.attributes.entries()) {
            if (att.attType == 'array') {
                //tem que criar um json vector temporario e converter cada elemento para um json
                var tempVariable = 'json ' + att.attName + '_json = ' + JSON_TYPES_MAP.get(att.attType) + '();'
                result = result.concat(indent(indentLevel) + tempVariable)
                result = result.concat(newLine())
                result = result.concat(indent(indentLevel) + 'if(' + att.attName + '.size() > 0)')
                result = result.concat(newLine() + indent(indentLevel) + '{')
                indentLevel = indentLevel + 2
                result = result.concat(newLine() + indent(indentLevel))
                var itemType = TYPES_MAP.get(att.itemsType!)
                result = result.concat('for(' + itemType + ' item:' + att.attName + ')')
                result = result.concat(newLine() + indent(indentLevel) + '{')
                indentLevel = indentLevel + 2
                //se o tipo nao é objeto entao insere diretamente.
                if (itemType != 'object') {
                    var varName = att.attName + '_json'
                    result = result.concat(newLine() + indent(indentLevel) + varName + '.push_back(item);')
                } else {
                    //tem que converter todos os itens em json e coloca-los na variavel temporaria
                }

                indentLevel = indentLevel - 2
                result = result.concat(newLine() + indent(indentLevel) + '}')
                indentLevel = indentLevel - 2
                result = result.concat(newLine() + indent(indentLevel) + '}')

            } else {
                //se o tipo do atributo nao necessita conversao entao preenche direto
                result = result.concat(indent(indentLevel) + 'result["' + att.attName + '"] = this->' + att.attName)
            }
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

    buildFromJsonOperation(classObj: ClassType, indentLevel: number) {
        var result: string = ''

        result = result.concat(indent(indentLevel))
        result = result.concat('static ' + classObj.className + ' from_json(json json_obj)')
        result = result.concat(newLine() + indent(indentLevel) + '{')
        indentLevel = indentLevel + 2
        result = result.concat(newLine() + indent(indentLevel) + 'return from_json_string(json_obj.dump());')
        indentLevel = indentLevel - 2
        result = result.concat(newLine() + indent(indentLevel) + '}')

        return result
    }

    /**
     * static JointInfo from_json(json json_obj)
    {
        return from_json_string(json_obj.dump());
    }
    */

    buildFromJsonStringOperation(classObj: ClassType, indentLevel: number) {
        var result: string = ''

        result = result.concat(indent(indentLevel))
        result = result.concat('static ' + classObj.className + ' from_json_string(std::string json_string)')
        result = result.concat(newLine() + indent(indentLevel) + '{')
        indentLevel = indentLevel + 2
        result = result.concat(newLine() + indent(indentLevel) + 'json json_obj = json::parse(json_string);')
        result = result.concat(newLine() + newLine())

        result = result.concat(indent(indentLevel) + classObj.className + ' result = ' + classObj.className + '();')
        result = result.concat(newLine())

        for (const [index, att] of classObj.attributes.entries()) {
            //se é to tipo array, os itens estao guardados em uma colecao no json e devem ser decuperados
            // como json numa variavel temporaria
            if (att.attType == 'array') {
                //tem que criar um json vector temporario e converter cada elemento para um json
                var tempVarName = att.attName + '_json'
                var tempVariableDecl = 'json ' + tempVarName + ' = json_obj["' + att.attName + '"];'
                result = result.concat(indent(indentLevel) + tempVariableDecl)
                result = result.concat(newLine() + indent(indentLevel))
                result = result.concat('for (json::iterator it = ' + tempVarName + '.begin(); it != ' + tempVarName + '.end(); ++it)')
                result = result.concat(newLine() + indent(indentLevel) + '{')
                indentLevel = indentLevel + 2
                result = result.concat(newLine() + indent(indentLevel) + 'result.' + att.attName + '.push_back(it.value());')

                indentLevel = indentLevel - 2
                result = result.concat(newLine() + indent(indentLevel) + '}')

            } else {
                //se o tipo do atributo nao necessita conversao entao preenche direto
                result = result.concat(indent(indentLevel) + 'result.' + att.attName + ' = json_obj["' + att.attName + '"];')
            }
            /**
             * json coords = json_obj["coordinates"];

                for (json::iterator it = coords.begin(); it != coords.end(); ++it)
                {
                    double c = it.value();
                    result.coordinates.push_back(c);
                }
            */
            result = result.concat(newLine())
        }

        //result = result.concat(newLine())
        result = result.concat(newLine() + indent(indentLevel) + 'return result;')

        indentLevel = indentLevel - 2
        result = result.concat(newLine() + indent(indentLevel) + '}')

        return result
    }

    /**
     * static JointInfo from_json_string(std::string json_string)
    {
        json json_obj = json::parse(json_string);

        JointInfo result = JointInfo();
        result.maximum = json_obj["maximum"];
        result.minimum = json_obj["minimum"];

        return result;
    }
    */
}

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
    result = result.concat(newLine())
    result = result.concat(buildFromJsonOperation(classObj, identLevel))

    result = result.concat(newLine())
    result = result.concat(newLine())
    result = result.concat(buildFromJsonStringOperation(classObj, identLevel))

    result = result.concat(newLine())
    result = result.concat('};')

    return result
}

function visitAttribute(attribute:AttributeType, indentLevel:number){
    var result:string = ''
    var apiType = attribute.attType
    var cppType = TYPES_MAP.get(apiType)!
    if(attribute.attType == 'array'){
        var mappedType = TYPES_MAP.get(attribute.itemsType!)
        if(mappedType){
            cppType = cppType.concat('<' + TYPES_MAP.get(attribute.itemsType!) + '>')
        } else {
            cppType = cppType.concat('<' + attribute.itemsTypeName + '>')
        }
        
    }
    result = result.concat(indent(indentLevel))
    if(!cppType){
        cppType = attribute.attTypeName!
    }
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
    result = result.concat(classObj.className + '()')
    result = result.concat(newLine())
    result = result.concat(indent(indentLevel) + '{')
    result = result.concat(newLine())
    indentLevel = indentLevel + 2
    
    for (const att of classObj.attributes) {
        var defaultValue = DEFAULT_VALUES_MAP.get(att.attType)!
        if (att.attType == 'array') {
            var mappedType = TYPES_MAP.get(att.itemsType!)
            if (mappedType) {
                defaultValue = defaultValue.concat('<' + TYPES_MAP.get(att.itemsType!) + '>()')
            } else {
                defaultValue = defaultValue.concat('<' + att.itemsTypeName + '>()')
            }
            
        }
        result = result.concat(indent(indentLevel) +  'this->' + att.attName + ' = ' + defaultValue + ';')

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
        //if the attributes are string then we must compare them with strcmp
        //for example strcmp(this->id.c_str(), other.id.c_str()) == 0;
        if(att.attType == 'string'){
            result = result.concat(indent(indentLevel) + 'strcmp(this->' + att.attName + '.c_str()' + ', ' + 'other.' + att.attName + '.c_str()) == 0;')
        } else {
            result = result.concat(indent(indentLevel) + 'this->' + att.attName + ' == other.' + att.attName)
        }
        
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
        if (att.attType == 'array') {
            //tem que criar um json vector temporario e converter cada elemento para um json
            var tempVariable = 'json ' + att.attName + '_json = ' + JSON_TYPES_MAP.get(att.attType) + '();' 
            result = result.concat(indent(indentLevel) + tempVariable)
            result = result.concat(newLine())
            result = result.concat(indent(indentLevel) + 'if(' + att.attName + '.size() > 0)')
            result = result.concat(newLine() + indent(indentLevel) + '{')
            indentLevel = indentLevel + 2
            result = result.concat(newLine() + indent(indentLevel))
            var itemType = TYPES_MAP.get(att.itemsType!)
            if (!itemType) {
                itemType = att.itemsTypeName
            } 
            result = result.concat('for(' + itemType + ' item:' + att.attName + ')')
            result = result.concat(newLine() + indent(indentLevel) + '{')
            indentLevel = indentLevel + 2
            //se o tipo nao é objeto entao insere diretamente.
            if(itemType != 'object'){
                var varName = att.attName + '_json'
                result = result.concat(newLine() + indent(indentLevel) + varName + '.push_back(item);')
            } else {
                //tem que converter todos os itens em json e coloca-los na variavel temporaria
            }
            
            indentLevel = indentLevel - 2
            result = result.concat(newLine() + indent(indentLevel) + '}')
            indentLevel = indentLevel - 2
            result = result.concat(newLine() + indent(indentLevel) + '}')
            
        } else {
            //se o tipo do atributo nao necessita conversao entao preenche direto
            result = result.concat(indent(indentLevel) + 'result["' + att.attName + '"] = this->' + att.attName)
        }
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

function buildFromJsonOperation(classObj: ClassType, indentLevel: number){
        var result: string = ''

        result = result.concat(indent(indentLevel))
        result = result.concat('static ' + classObj.className + ' from_json(json json_obj)')
        result = result.concat(newLine() + indent(indentLevel) + '{')
        indentLevel = indentLevel + 2
        result = result.concat(newLine() + indent(indentLevel) + 'return from_json_string(json_obj.dump());')
        indentLevel = indentLevel - 2
        result = result.concat(newLine() + indent(indentLevel) + '}')

        return result
    }

    /**
     * static JointInfo from_json(json json_obj)
    {
        return from_json_string(json_obj.dump());
    }
     */

    function buildFromJsonStringOperation(classObj: ClassType, indentLevel: number){
        var result: string = ''

        result = result.concat(indent(indentLevel))
        result = result.concat('static ' + classObj.className + ' from_json_string(std::string json_string)')
        result = result.concat(newLine() + indent(indentLevel) + '{')
        indentLevel = indentLevel + 2
        result = result.concat(newLine() + indent(indentLevel) + 'json json_obj = json::parse(json_string);')
        result = result.concat(newLine() + newLine())

        result = result.concat(indent(indentLevel) + classObj.className + ' result = ' + classObj.className + '();')
        result = result.concat(newLine())
        
        for (const [index, att] of classObj.attributes.entries()) {
            //se é to tipo array, os itens estao guardados em uma colecao no json e devem ser decuperados
            // como json numa variavel temporaria
            if (att.attType == 'array') {
                //tem que criar um json vector temporario e converter cada elemento para um json
                var tempVarName = att.attName + '_json'
                var tempVariableDecl = 'json ' + tempVarName + ' = json_obj["' + att.attName + '"];'
                result = result.concat(indent(indentLevel) + tempVariableDecl)
                result = result.concat(newLine() + indent(indentLevel))
                result = result.concat('for (json::iterator it = ' + tempVarName + '.begin(); it != ' + tempVarName + '.end(); ++it)')
                result = result.concat(newLine() + indent(indentLevel) + '{')
                indentLevel = indentLevel + 2
                result = result.concat(newLine() + indent(indentLevel) + 'result.'+ att.attName + '.push_back(it.value());')
                
                indentLevel = indentLevel - 2
                result = result.concat(newLine() + indent(indentLevel) + '}')
                
            } else {
                //se o tipo do atributo nao necessita conversao entao preenche direto
                result = result.concat(indent(indentLevel) + 'result.' + att.attName + ' = json_obj["' + att.attName + '"];')
            }
            /**
             * json coords = json_obj["coordinates"];

                for (json::iterator it = coords.begin(); it != coords.end(); ++it)
                {
                    double c = it.value();
                    result.coordinates.push_back(c);
                }
             */
            result = result.concat(newLine())
        }

        //result = result.concat(newLine())
        result = result.concat(newLine() + indent(indentLevel) + 'return result;')

        indentLevel = indentLevel - 2
        result = result.concat(newLine() + indent(indentLevel) + '}')

        return result
    }

    /**
     * static JointInfo from_json_string(std::string json_string)
    {
        json json_obj = json::parse(json_string);

        JointInfo result = JointInfo();
        result.maximum = json_obj["maximum"];
        result.minimum = json_obj["minimum"];

        return result;
    }
     */