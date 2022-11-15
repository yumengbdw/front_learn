~（波浪号）：A ~ B表示选择A标签后的所有B标签，但是A和B标签必须有相同的父元素。

+（加号）加号又被称作兄弟选择器。A+B表示选择紧邻在A后面的B元素，且A和B必须拥有相同的父元素，所选到的仅为一个B元素标签。

\> 大于号表示某个元素的第一代元素。A>B指选择A元素里面的B元素，其中B元素是A元素的第一代。

中括号
span[class='test']匹配所有带有class类名test的span标签
span[class *='test']模糊匹配class包含了test字符串的span标签
span[class]匹配所有带class属性的标签