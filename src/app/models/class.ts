import { AttributeType } from "./attribute"

export class ClassType {
    className!:string
    attributes:AttributeType[] = []

    constructor(name:string, atts:AttributeType[]) {
        this.className = name
        this.attributes = atts
    }
}