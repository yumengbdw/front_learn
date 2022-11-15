let myFavoriteNumber: string | number;
myFavoriteNumber = 'seven';
console.log(myFavoriteNumber.length); // 5
myFavoriteNumber = 7;
// console.log(myFavoriteNumber.length); // 编译时报错

function funcName1(x:number, y:number = 1, z?:string): number {
    return  x + y
}


// let x: unknown = 'aBdc'
// // 直接使用
// const upName = x.toLowerCase(); // Error
// // typeof
// if (typeof x === 'string') {
//     const upName = x.toLowerCase(); // OK
// }
// // 类型断言
// const upName2 = (x as string).toLowerCase(); // OK


let name2!: number;
console.log(name2 * 2)

function initial() {
    name2 = 3
}


interface Config {
    a : 'hello' | 'world' | 'lalala';
    isEnable:  true;
    margin: 0 | 2 | 4;
}

const configValue : Config = {
    a: 'hello',
    isEnable: true,
    margin: 0
}
type Type1Props = {
    name: string
    age: number
    weight: number
}
type Type2Props = {
    align: string
    value: string
}
type Type3Props = {
    wight: number
    length: number
}

interface ComTypes{
        type1 : Type1Props,
        type2 : Type2Props,
        type3 : Type3Props,
}
type ValueComTypes = ComTypes[keyof ComTypes]



