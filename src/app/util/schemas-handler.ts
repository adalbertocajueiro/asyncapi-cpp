import { HttpClient } from "@angular/common/http";
import { SchemaInterface } from "@asyncapi/parser";
import { Schema } from "@asyncapi/parser/esm/models/v2/schema";
import { Schemas } from "@asyncapi/parser/esm/models/v2/schemas";

//export const yamlContent = fs.readFileSync('./files/edscorbot-async-api.yaml', 'utf-8');

export var yamlContent: any

export class SchemasHandler {

    allSchemas?:Schemas
    independentSchemas:Schemas = new Schemas([])
    dependentSchemas:Schemas = new Schemas([])
    orderedDependencies:Set<string> = new Set<string>()


    constructor(schemas:Schemas){
        this.allSchemas = schemas
        console.log('schemas',this.allSchemas)
        this.extractDependentSchemas()
    }

    private extractDependentSchemas(){
        this.allSchemas?.forEach( schema => {
            //console.log(schema.id(), schema.properties())
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
        
        console.log ('ordered dependencies', this.orderedDependencies)
        console.log('independent schemas', this.independentSchemas)
        console.log('dependent schemas', this.dependentSchemas)
    }

    dependencies(schema:Schema){
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