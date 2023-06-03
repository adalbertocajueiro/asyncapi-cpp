export class AttributeType{
    attName!:string
    attType!:string
    itemsType?:string

    constructor(name:string, type:string, itType?:string){
        this.attName = name
        this.attType = type
        this.itemsType = itType
    }
}