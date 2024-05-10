class Scheduler {
    constructor(max) {
        this.max = max;
        this.count = 0; // 用来记录当前正在执行的异步函数
        this.queue = new Array(); // 表示等待队列
    }
    async add(promiseCreator) {

        if (this.count >= this.max) {
            await new Promise(resolve => this.queue.push(resolve))
        }
        // 如果在max范围内的话直接执行，
        this.count++
        const res = await promiseCreator()
        //执行完后count--
        this.count--
        if (this.queue.length) {
            this.queue.shift()()// 执行被阻塞的resolve。只有执行了resolve的话才能走后面的代码

        }

        return res

    }
}

const timeout = time =>
    new Promise(resolve => {
        setTimeout(resolve, time);
    });

const scheduler = new Scheduler(2);

const addTask = (time, order) => {
    //add返回一个promise，参数也是一个promise
    // scheduler.add(() => timeout(time)).then(() => console.log(order));
    timeout(time).then(() => console.log(order))
};

addTask(1000, '1');
addTask(500, '2');
addTask(300, '3');
addTask(100, '4');
addTask(400, '5');

// output: 2 3 4 1 5

首先分析正常输出应该是 4, 3, 2, 5, 1 现在要求输出变为2 3 4 1 5


// 正常结果应该是四个addTask同时执行，输出顺序应该是根据等待时间排序的，也就是 3, 4, 2, 1

// 需求要求做到输出顺序为主观调用顺序来输出  2314


// 所以这道题的关键是不resolve不执行的话后面就没法执行。