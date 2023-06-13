export function newLine(n?:number) {
    if(n){
        return Array.from({ length: n }, () => '\n').join('')
    } else {
        return '\n'
    }
    
}

export function indent(n: number) {
    return Array.from({ length: n }, () => ' ').join('')
}