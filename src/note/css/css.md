## 1. 绝对定位居中

此方式无法使用动画。

```css
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
```



最好方式是下面

```css
    position: absolute;
    width: fit-content;
    height: fit-content;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    text-align: center;

```