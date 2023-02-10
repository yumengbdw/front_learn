1. 渐变色
 var gradient1 = ctx.createLinearGradient(10, 10, 400, 10);
gradient1.addColorStop(0, "#00ff00");
gradient1.addColorStop(1, "#ff0000");
ctx.fillStyle = gradient1;

2. 虚线样式
// 5的实线 10的空白  20 的实线  5的空白， 10的实线
ctx.setLineDash([5, 10, 20]);
console.log(ctx.getLineDash()); // [5, 10, 20, 5, 10, 20]

3. 绘制图案
一般用来绘制背景图，设置背景类型 repeat, repeat-x, repeat-y, no-repeat

createPattern

```js
// 获取 canvas 元素
    var canvas = document.getElementById('canvas');
    // 通过判断getContext方法是否存在来判断浏览器的支持性
    if(canvas.getContext) {
      // 获取绘图上下文
      var ctx = canvas.getContext('2d');
      // 创建一个 image对象
      var img = new Image();
      img.src = "./image.png";
      img.onload = function() {
        // 图片加载完以后
        // 创建图案
        var ptrn = ctx.createPattern(img, 'no-repeat');
        ctx.fillStyle = ptrn;
        ctx.fillRect(0, 0, 500, 500);
      }
    }
```

4. 文本居中
```js
          ctx_button2.font = '16px 微软雅黑'
            ctx_button2.fillStyle =  button2Color.text
            // 设置水平居中
            ctx_button2.textAlign = "center";
            // 设置垂直对齐方式
            ctx_button2.textBaseline = "middle";
            ctx_button2.fillText('按钮二', 86, 20)
```

文本宽度
     ` var textWidth = ctx.measureText("Hi Canvas !").width;`


5. 图片

裁剪
drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight）

缩放
drawImage(image, dx, dy, dWidth, dHeight)：