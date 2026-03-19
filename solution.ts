function deepClone<T>(obj: T, visited = new WeakMap<any, any>()): T {
    // Обработка примитивных типов и null
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // Проверка на циклические ссылки
    if (visited.has(obj)) {
        return visited.get(obj);
    }

    // Обработка Date
    if (obj instanceof Date) {
        return new Date(obj.getTime()) as any;
    }

    // Обработка RegExp
    if (obj instanceof RegExp) {
        return new RegExp(obj.source, obj.flags) as any;
    }

    // Обработка Map
    if (obj instanceof Map) {
        const mapCopy = new Map();
        visited.set(obj, mapCopy);
        
        obj.forEach((value, key) => {
            mapCopy.set(deepClone(key, visited), deepClone(value, visited));
        });
        
        return mapCopy as any;
    }

    // Обработка Set
    if (obj instanceof Set) {
        const setCopy = new Set();
        visited.set(obj, setCopy);
        
        obj.forEach(value => {
            setCopy.add(deepClone(value, visited));
        });
        
        return setCopy as any;
    }

    // Обработка массивов
    if (Array.isArray(obj)) {
        const arrayCopy: any[] = [];
        visited.set(obj, arrayCopy);
        
        obj.forEach((item, index) => {
            arrayCopy[index] = deepClone(item, visited);
        });
        
        return arrayCopy as any;
    }

    // Обработка типизированных массивов
    if (ArrayBuffer.isView(obj) && !(obj instanceof DataView)) {
        return new (obj.constructor as any)(obj) as any;
    }

    // Обработка DataView
    if (obj instanceof DataView) {
        return new DataView(obj.buffer.slice(0)) as any;
    }

    // Обработка ArrayBuffer
    if (obj instanceof ArrayBuffer) {
        return obj.slice(0) as any;
    }

    // Обработка обычных объектов
    // Сохраняем прототип
    const proto = Object.getPrototypeOf(obj);
    const clone = Object.create(proto);
    visited.set(obj, clone);

    // Получаем все ключи, включая символы
    const keys = [
        ...Object.getOwnPropertyNames(obj),
        ...Object.getOwnPropertySymbols(obj)
    ];

    for (const key of keys) {
        const descriptor = Object.getOwnPropertyDescriptor(obj, key);
        
        if (descriptor) {
            if (descriptor.get || descriptor.set) {
                // Копирование геттеров/сеттеров
                Object.defineProperty(clone, key, {
                    get: descriptor.get,
                    set: descriptor.set,
                    enumerable: descriptor.enumerable,
                    configurable: descriptor.configurable
                });
            } else if ('value' in descriptor) {
                // Копирование обычных свойств
                clone[key] = deepClone(obj[key as keyof T], visited);
            }
        }
    }

    return clone as T;
}
