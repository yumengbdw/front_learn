# 1. css基础

~（波浪号）：A ~ B表示选择A标签后的所有B标签，但是A和B标签必须有相同的父元素。

+（加号）加号又被称作兄弟选择器。A+B表示选择紧邻在A后面的B元素，且A和B必须拥有相同的父元素，所选到的仅为一个B元素标签。

\> 大于号表示某个元素的第一代元素。A>B指选择A元素里面的B元素，其中B元素是A元素的第一代。

中括号
span[class='test']匹配所有带有class类名test的span标签
span[class *='test']模糊匹配class包含了test字符串的span标签
span[class]匹配所有带class属性的标签
》
# 2. 性能优化 `content-visibility`
content-visibility 浏览器不可见区域不渲染，contain-intrinsic-size预设高度防止不渲染区域滑动导致滚动条抖动问题
```css
content-visibility: auto;
contain-intrinsic-size: 200px;
```


# 3. 空格
`&nbsp;`字符：不断行的空白格，该空格占据的宽度受字体影响(一个字符宽度)。
`&ensp;`字符：相当全角状态键入半个“空格”键（半个汉字的宽度，一个字符宽度）。
`&emsp;`字符：相当全角状态键入“空格”键（1个汉字的宽度，两个字符宽度）。

# 4.BFC 块格式化上下文

>  block, list-item, table 的元素，会生成 block-level box。并且参与 block formatting context；  

>inline-level box:display 属性为 inline, inline-block, inline-table 的元素，会生成 inline-level box。并且参与 inline formatting context；

bfc特性 
1. 垂直排列
2. 节点的垂直方向距离由margin决定，相邻节点的margin会发生重叠，以最大margin为合并值
3. BFC就是页面中的一个隔离的独立容器，容器里的标签不会影响到外部标签
4. 垂直方向的距离由margin决定， 属于同一个BFC的两个相邻的标签外边距会发生重叠
5. 计算BFC的高度时，浮动元素也参与计算


如何形成bfc
> 根节点：html
非溢出可见节点：overflow:!visible
浮动节点：float:left/right
绝对定位节点：position:absolute/fixed
被定义为块级的非块级节点：display:inline-block/table-cell/table-caption/flex/inline-flex/grid/inline-grid


造成的问题
1. [父盒子高度塌陷，兄弟盒子重叠。](./浮动元素对bfc影响.html)

#### 1. 兄弟盒子重叠
在有son2的情况下，发现song2和son1重叠了，这是以为在明确son1是float left情况下 son1明确形成了bfc可是son2没有形成。解决办法使得son2也形成bfc

根据形成bfc规则 以下任意属性均满足
```css
    /* display: flex; */
    /* overflow: hidden; */
    float: left;
```
#### 2. 父元素高度塌陷
删除son2 发现父元素高度塌陷了。
根据BFC规则 
>  计算BFC的高度时，浮动元素也参与计算

所以我们只需明确父元素为bfc即可。
因此运用上述形成bfc条件
以下任意条件均满足
```css
    /* overflow: hidden; */
    /* display: flex; */
    /* float: left; */
    position: absolute;
```


2. 宽度挤压

3. [margin边距不生效](./父子margin重叠.html)

  - ### 父子元素 margin 重叠问题
  解决办法 父元素增加下面任意一个属性，使其形成bfc
  ```css
   position: absolute;
    /* float: left; */
    /* display: flow-root; */
    /* overflow: hidden; */
    /* padding: 1px; */
    /* border: 1px solid transparent;

```

  - ### 两个子元素margin合并

son1和son2 都有margin 10px 两个盒子应该垂直距离相差20px结果两个盒子的距离只有10px。
这个是由于以下规则决定的
> 节点的垂直方向距离由margin决定，相邻节点的margin会发生重叠，以最大margin为合并值

  要解决两个子元素margin合并问题我们可以
 #### 1. 包裹一层元素。

  ```html
  <div style="display: flex">
       <div class="son2"></div>
</div>
  ```
根据bfc规则
>BFC就是页面中的一个隔离的独立容器，容器里的标签不会影响到外部标签

所以可以解决此问题，实际上把`<div class="son2"></div>` 改成`<p class="son2"></p>`也可解决，原理一致

 #### 2. 人为son1用padding son2用margin





# 5. 脱流文档流
- float:left/right
节点参与浮动布局后，自身脱流但其文本不脱流。

- position:absolute/fixed

节点参与定位布局后，自身及其文本一起脱流。

# 6. 不占控件隐藏显示
display: none
position:absolute; opacity:0

占空间隐藏
visibility:hidden 不可点
opacity:0  可点