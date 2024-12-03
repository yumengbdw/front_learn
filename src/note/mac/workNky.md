    // <Popover
      //   overlay={rightMenu.map((item, index) => {
      //     return <Popover.Item value={'test'} key={item.value}>
      //       <Pressable onPress={() => {
      //       }}>
      //         <Text style={[styles.menuTitle, index === rightMenu.length - 1 && styles.menuLastTitle]}>{item.title}</Text>
      //       </Pressable>
      //     </Popover.Item>
      //   })}
      //   useNativeDriver
      //   placement="auto"
      //   duration={200}>

<!-- EmptyPopup  Shadow -->

```css
 content: {
    position: 'absolute',
    right: 12,
    top: 0,
    width: 100,
    backgroundColor: '#ffffff',
    zIndex: 1,
    // padding: 10,
    paddingTop: 0,
    // borderTopLeftRadius: 10,
    // borderTopRightRadius: 10

  },

  shadowPopStyle: {
    width: 100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuTitle: {
    width: 100,
    textAlign: 'center',

    fontSize: 16,
    color: '#f21717',// error-5
    fontWeight: '400',

    lineHeight: 22,
    paddingVertical: 5,
    borderBottomColor: '#f2f2f2',
    borderBottomWidth: 1

  },
  menuLastTitle: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 0
  }

```
