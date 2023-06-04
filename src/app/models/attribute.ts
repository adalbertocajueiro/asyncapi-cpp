export class AttributeType{
    attName!:string
    attType!:string
    attTypeName?:string
    itemsType?:string
    itemsTypeName?:string

    constructor(name: string, type: string, aTypeName?:string, itType?:string, itTypeName?:string){
        this.attName = name
        this.attType = type
        this.attTypeName = aTypeName
        this.itemsType = itType
        this.itemsTypeName = itTypeName
    }
}