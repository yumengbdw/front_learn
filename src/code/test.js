function test() {
    return function (target) {
        console.log(target)
    }
}

@test
class Class {

}