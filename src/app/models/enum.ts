export class EnumType {
    name!:string
    items!:EnumItem[]

    constructor(name:string, items:EnumItem[]){
        this.name = name
        this.items = items
    }
}

export class EnumItem {
    name!:string
    value?:any

    constructor(name:string, value?:any){
        this.name = name
        this.value =value
    }
}