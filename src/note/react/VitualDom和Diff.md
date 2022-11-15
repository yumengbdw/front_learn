## 1. 面试题：jsx是什么，是html吗？

> 首先jsx不是html 只是以类似html的形式来定义页面，
> 实际是根据写的jsx生成Virtual Dom ，
> 然后再根据virtual dom来用js中的dom相关api生成实际页面

```javascript
<div className="container">
    <div>Hello React</div>
    <p>React is great</p>
</div>
```

## 2. Virtual-Dom 是什么

> virtual dom实际就是jsx转换为用key value形式来描述jsx的对象

上面的jsx对应的dom会转化为下面的形式

```javascript
{
    type: "div",
        props
:
    {
        className: "container"
    }
,
    children: [
        {
            type: "div",
            props: null,
            children: [
                {
                    type: "text",
                    props: {
                        textContent: "Hello React"
                    }
                }
            ]
        },
        {
            type: "p",
            props: null,
            children: [
                {
                    type: "text",
                    props: {
                        textContent: "React is great"
                    }
                }
            ]
        }
    ]
}


```

没错上面的对象就是虚拟dom

## 为什么虚拟dom能够提高效率

虚拟dom如何工作的呢 实际开发过程中频繁操作dom是最耗性能的。 实际上正式由于虚拟dom操作的便利性 我们可以对比数据是否变化，有变化， 对变化的部分的dom做对应的增删改查操作。 没变化就不会更新

before

```javascript
<div className="container">
    <div>123</div>
</div>
```

after

```javascript
<div className="container">
    <div>123</div>
</div>
```

对应虚拟dom

```javascript
{
    type: "div",
        props
:
    {
        className: "container"
    }
,
    children: [
        {
            type: "div",
            props: null,
            children: [
                {
                    type: "text",
                    props: {
①            textContent: "123"
}
}
]
}
]
}


```

实际变化的就是①处的123变成了456

## Virtual-Dom 如何工作

babel 会将jsx转化为

https://babeljs.io/repl#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=false&corejs=3.21&spec=false&loose=false&code_lz=DwEwlgbgBAdghgWwKYF4oHIDMn0D4BQUUokuA3gGYCuMAxgCID2tAvsAPTgQFH4dcF81OgBcwjGFGoNmACgCUUMoSgAnJCKqrJJbsNpiJUWowQAHCUhgj-pfCyA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=env%2Creact%2Cstage-2&prettier=false&targets=&version=7.18.5&externalPlugins=&assumptions=%7B%7D

### 创建Virtual-Dom

### 生成对应的页面

## diff 算法

1.属性删除

```javascript



import React, {PureComponent} from 'react'
import './form.less'
import * as PropTypes from 'prop-types'
import {PartTitleType} from '../../utils/constant'
import {Button} from 'antd'

class PartTitle extends PureComponent {
    static defaultProps = {
        partTitleType: PartTitleType.PartTitleType_Label,
        haveLine: true,
        extraTitleElement: null,
        partStyle: {}
    }


    render() {
        return (
            <div className={`part-title ${this.props.haveLine ? 'part-title-bottom-line' : ''}`}
                 style={this.props.partStyle}>
                <div className={'mark-div'}>
                    <div className={`mark-view${this.props.size ? '-small' : ''}`}/>
                    <span className={'top-title'} style={this.props.partTitleFontStyle}>{this.props.title}</span>
                    {this.props.extraTitleElement}
                </div>
                {this.renderRightPart()}
            </div>
        )
    }

    renderRightPart() {
        if (PartTitleType.PartTitleType_Button === this.props.partTitleType) {
            return <Button type='primary'
                           onClick={() => this.props.onItemClicked && this.props.onItemClicked(this.props.detailTitle)}>{this.props.detailTitle}</Button>
        } else if (PartTitleType.PartTitleType_Label === this.props.partTitleType) {
            return <label className={'span-label'}
                          onClick={() => this.props.onItemClicked && this.props.onItemClicked(this.props.detailTitle)}>{this.props.detailTitle}</label>
        } else if (PartTitleType.PartTitleType_Children === this.props.partTitleType && this.props.children) {
            return this.props.children
        }
    }
}

export default PartTitle
```