import { SchemaInterface } from "@asyncapi/parser";
import { Schema } from "@asyncapi/parser/esm/models/v2/schema";
import { Schemas } from "@asyncapi/parser/esm/models/v2/schemas";
import { CppSchemaBuilderVisitor } from "../visitors/CppSchemaBuilderVisitor";
import { CppSchemaGeneratorVisitor } from "../visitors/CppSchemaGeneratorVisitor";

//export const yamlContent = fs.readFileSync('./files/edscorbot-async-api.yaml', 'utf-8');

export var yamlContent: any

export class SchemasHandler {

    allSchemas?:Schemas
    independentSchemas:Schemas = new Schemas([])
    dependentSchemas:Schemas = new Schemas([])
    orderedDependencies:Set<string> = new Set<string>()

    independentNodes: any[] = []
    dependentNodes: any[] = []

    schemaBuilder?:CppSchemaBuilderVisitor
    scchemaGenerator?:CppSchemaGeneratorVisitor

    constructor(schemas:Schemas){
        this.allSchemas = schemas
        this.extractDependentSchemas()
        this.schemaBuilder = new CppSchemaBuilderVisitor()
        this.scchemaGenerator = new CppSchemaGeneratorVisitor()
        this.buildNodes()
    }

    generateDefinitions() {
        var result = ''

        result = result.concat('#include <string>\n')
        result = result.concat('#include "nlohmann/json.hpp"\n\n')

        result = result.concat('using json = nlohmann::json;\n\n')

        var cppGenerator = new CppSchemaGeneratorVisitor()
        this.independentNodes.forEach(node => {
            result = result.concat(cppGenerator.visitNode(node))
            result = result.concat('\n\n')
        })

        this.dependentNodes.forEach(node => {
            result = result.concat(cppGenerator.visitNode(node))
            result = result.concat('\n\n')
        })

        return result
    }

    buildNodes() {
        this.independentSchemas.forEach(sch => {
            var astBuilder = new CppSchemaBuilderVisitor()
            var node = astBuilder.buildNode(sch)
            if (node) {
                this.independentNodes.push(node)
            }
        })
        this.dependentSchemas.forEach(sch => {
            var astBuilder = new CppSchemaBuilderVisitor()
            var cppGenerator = new CppSchemaGeneratorVisitor()
            var node = astBuilder.buildNode(sch)
            if (node) {
                this.dependentNodes.push(node)
            }
        })
    }

    private extractDependentSchemas(){
        this.allSchemas?.forEach( schema => {
            {
                if (this.isDependent(schema.id(), schema)) {
                    this.dependentSchemas.push(schema)
                    this.dependencies(schema)
                } else {
                    this.independentSchemas.push(schema)
                }
            }  
        })

        
        this.independentSchemas.sort( (sch1, sch2) => {
            var comparison = 0
            if(sch1.enum()){
                if(!sch2.enum()){
                    comparison = -1
                }
            } else {
                if(sch2.enum()){
                    comparison = 1
                }
            }
            return comparison
        } )
        this.dependentSchemas.sort((sch1, sch2) => {
            var result = 0
            if(this.orderedDependencies.has(sch1.id())){
                if (!this.orderedDependencies.has(sch2.id())){
                    result = -1
                }
            } else {
                if (this.orderedDependencies.has(sch2.id())) {
                    result = 1
                }
            }
            return result
        })
        //a ordenacao precisa ser diferente e baseada num grafo de dependencias
        //TODO ordenacao de esquemas antes da geracao ainda nao funciona com escopos
        // com mais de um objeto interno a outro
    }

    private dependencies(schema:Schema){
        if (schema.type() == 'array'){
            var items = schema.items() as Schema[]
            items.forEach(item => {
                this.dependencies(item)
            })
        } else if(schema.type() == 'object'){
            var properties = schema.properties()
            if(properties){
                var entries = Object.entries(properties)
                entries.forEach( entry => {
                    if(entry[1].type() == 'object'){
                        this.orderedDependencies.add(entry[1].id())
                    }
                })
            }
        }
    }
    private isDependent(parentID:string,schema:Schema):boolean{
        var result: boolean = false;
        
        var idSch = schema.id()
        if (!idSch.includes('anonymous-schema') && !idSch.includes(parentID)){
            result = true
        } else{
            //pega todos os ids de esquems descendentes e verifica se tem um que nao é anonimo e é
            //diferente do id atual
            var properties = schema.properties()
            if (properties) {
                var values = Object.values(properties)
                for (var sch of values) {
                    var id = sch.id()
                    if (!id.includes('anonymous-schema')) {
                        result = !id.includes(parentID)
                        //it is dependent
                        if (result) {
                            break;
                        }
                    } else {
                        if (sch.type() == 'array') {
                            var items = sch.items() as SchemaInterface
                            result = this.isDependent(parentID, items)
                        } else {
                            result = id.includes(parentID)
                            //it is independent
                            if (result) {
                                break;
                            }
                        }
                    }
                    //console.log(schema.id(), schema.json())
                }
            } else {
                if (schema.type() == 'array') {
                    var items = schema.items() as SchemaInterface
                    result = this.isDependent(parentID, items)
                }
            }
        }

        return result
    }
}