interface DictionaryItemModel {
    meaning: string;
    type: string;
    examples: string[];
}

export interface DictionaryModel {
    [key:string]: DictionaryItemModel;
}

export type DictionaryArrModel = [string, DictionaryItemModel];