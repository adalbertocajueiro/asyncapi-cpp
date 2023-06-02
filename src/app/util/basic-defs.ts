//possible types
export const AsyncType: string[] = [
    'array', 'boolean', 'integer', 'number', 'string', 'object'
]

//structure containing mapping of async api primitive types to c++ primitive types
export const TYPES_MAP:Map<string, string> = new Map<string,string>(
    [
        ['integer','int'],
        ['number','double'],
        ['boolean','bool'],
        ['string','std::string'],
        ['array','std::list']
    ]
)

export const DEFAULT_VALUES_MAP: Map<string, string> = new Map<string, string>(
    [
        ['integer', '0'],
        ['number', '0.0'],
        ['boolean', 'false'],
        ['string', '""'],
        ['array', 'std::list']
    ]
)