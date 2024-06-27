# 1. css 基础

~（波浪号）：A ~ B 表示选择 A 标签后的所有 B 标签，但是 A 和 B 标签必须有相同的父元素。

+（加号）加号又被称作兄弟选择器。A+B 表示选择紧邻在 A 后面的 B 元素，且 A 和 B 必须拥有相同的父元素，所选到的仅为一个 B 元素标签。

\> 大于号表示某个元素的第一代元素。A>B 指选择 A 元素里面的 B 元素，其中 B 元素是 A 元素的第一代。

中括号
span[class='test']匹配所有带有 class 类名 test 的 span 标签
span[class *='test']模糊匹配 class 包含了 test 字符串的 span 标签
span[class]匹配所有带 class 属性的标签
》

# 2. 性能优化 `content-visibility`

content-visibility 浏览器不可见区域不渲染，contain-intrinsic-size 预设高度防止不渲染区域滑动导致滚动条抖动问题

```css
content-visibility: auto;
contain-intrinsic-size: 200px;
```

# 3. 空格

`&nbsp;`字符：不断行的空白格，该空格占据的宽度受字体影响(一个字符宽度)。
`&ensp;`字符：相当全角状态键入半个“空格”键（半个汉字的宽度，一个字符宽度）。
`&emsp;`字符：相当全角状态键入“空格”键（1 个汉字的宽度，两个字符宽度）。

# 4.BFC 块格式化上下文

> block, list-item, table 的元素，会生成 block-level box。并且参与 block formatting context；

> inline-level box:display 属性为 inline, inline-block, inline-table 的元素，会生成 inline-level box。并且参与 inline formatting context；

bfc 特性

1. 垂直排列
2. 节点的垂直方向距离由 margin 决定，相邻节点的 margin 会发生重叠，以最大 margin 为合并值
3. BFC 就是页面中的一个隔离的独立容器，容器里的标签不会影响到外部标签
4. 垂直方向的距离由 margin 决定， 属于同一个 BFC 的两个相邻的标签外边距会发生重叠
5. 计算 BFC 的高度时，浮动元素也参与计算

如何形成 bfc

> 根节点：html
> 非溢出可见节点：overflow:!visible
> 浮动节点：float:left/right
> 绝对定位节点：position:absolute/fixed
> 被定义为块级的非块级节点：display:inline-block/table-cell/table-caption/flex/inline-flex/grid/inline-grid

造成的问题

1. [父盒子高度塌陷，兄弟盒子重叠。](./浮动元素对bfc影响.html)

#### 1. 兄弟盒子重叠

在有 son2 的情况下，发现 song2 和 son1 重叠了，这是以为在明确 son1 是 float left 情况下 son1 明确形成了 bfc 可是 son2 没有形成。解决办法使得 son2 也形成 bfc

根据形成 bfc 规则 以下任意属性均满足

```css
/* display: flex; */
/* overflow: hidden; */
float: left;
```

#### 2. 父元素高度塌陷

删除 son2 发现父元素高度塌陷了。
根据 BFC 规则

> 计算 BFC 的高度时，浮动元素也参与计算

所以我们只需明确父元素为 bfc 即可。
因此运用上述形成 bfc 条件
以下任意条件均满足

```css
/* overflow: hidden; */
/* display: flex; */
/* float: left; */
position: absolute;
```

2. 宽度挤压

3. [margin 边距不生效](./父子margin重叠.html)

- ### 父子元素 margin 重叠问题
  解决办法 父元素增加下面任意一个属性，使其形成 bfc

```css
 position: absolute;
  /* float: left; */
  /* display: flow-root; */
  /* overflow: hidden; */
  /* padding: 1px; */
  /* border: 1px solid transparent;

```

- ### 两个子元素 margin 合并

son1 和 son2 都有 margin 10px 两个盒子应该垂直距离相差 20px 结果两个盒子的距离只有 10px。
这个是由于以下规则决定的

> 节点的垂直方向距离由 margin 决定，相邻节点的 margin 会发生重叠，以最大 margin 为合并值

要解决两个子元素 margin 合并问题我们可以

#### 1. 包裹一层元素。

```html
<div style="display: flex">
  <div class="son2"></div>
</div>
```

根据 bfc 规则

> BFC 就是页面中的一个隔离的独立容器，容器里的标签不会影响到外部标签

所以可以解决此问题，实际上把`<div class="son2"></div>` 改成`<p class="son2"></p>`也可解决，原理一致

#### 2. 人为 son1 用 padding son2 用 margin

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
opacity:0 可点

# 7. [column 布局](./column%E5%B8%83%E5%B1%80.html)

column-count: 4;
column-gap: 0;

# 8. 面试水平居中，垂直居中

水平居中

margin:0 auto + width:fit-content：应用于全部元素
块级元素 + margin:0 auto + width：应用于块级元素
若节点不是块级元素需声明 display:block
若节点宽度已隐式声明则无需显式声明 width
行内元素 + text-aligin:center：应用于行内元素
父节点声明 text-align
若节点不是行内元素需声明 display:inline/inline-block
position + left/right + margin-left/right + width：应用于全部元素
position + left/right + transform:translateX(-50%)：应用于全部元素
display:flex + justify-content:center：应用于全部元素的子节点

垂直居中

块级元素 + padding-top/bottom：应用于块级元素
父节点高度未声明或自适应
若节点不是块级元素需声明 display:block
行内元素 + line-height：应用于行内元素
父节点声明 line-height
若节点不是行内元素需声明 display:inline/inline-block
display:table + display:table-cell + vertical-align:middle：应用于全部元素
父节点声明 display:table
子节点声明 display:table-cell 与 vertical-align:middle
display:table-cell + vertical-align:middle：应用于全部元素的子节点
position + top/bottom + margin-top/bottom + height：应用于全部元素
position + top/bottom + transform:translateY(-50%)：应用于全部元素
display:flex + align-items:center：应用于全部元素的子节点
display:flex + margin:auto 0：应用于全部元素
父节点中声明 display:flex
子节点声明 margin:auto 0

# 9.基础

A>B 表示在 A 的一级子元素中查找 B

A B 表示在 A 的内部查找 B（查找范围不仅包括子元素，还包括孙元素等）

A+B 表示与 A 相邻的 B 元素（平级关系，非父子关系）

这里的 A 和 B 代表的是选择器，选择器可以嵌套使用。

A.B，不表示相对关系，它表示类型是 A，class 名是 B 的元素，这个要注意。

```html
<textarea name="text" class="form-control">
  <div class="OwO">
    <svg></svg>
  </div>
</textarea>

document.querySelector('textarea.form-control[name=text]+div.OwO>.OwO-logo
svg');
```

DOM.innerText 和 textContent 的区别在于 innerText 会去掉多余的换行符
DOM.style，获取 DOM 元素的内联 CSS 样式
DOM.style.[css 名称] = 'xxx'，修改 DOM 元素的特定 CSS 属性为 xxx
DOM.style.cssText = 'aaa: xxx;'，直接修改 DOM 元素的内联 CSS 文本，可以一次设置多个 CSS

```
h1.style.cssText = "color: red"

```

appendChild 会将新插入的对象放在所有子元素的末尾

insertBefore 可以指定新插入的对象的位置

DOM.remove() 删除

# 10. 绝对定位居中

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
