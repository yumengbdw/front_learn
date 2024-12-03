CXMTabsView   底部tab对应页面


navigator有所有页面入口

import Index from '../home/index'; // 首页
import Discovery from '../discovery/index'; // 管理
import My from '../my/index'; // 我的

MixCashHome 开单页面


ReturnBasket 收框

CreditImportFormPage  赊欠录
CreditList  快速还款   BuyerDetail 买家详情  

Gathering 直接还款
RepaymentByOrder 按订单还款


InputSpend  录支出
MyShop  我的小店
BatchCountV630 结算单分享


let stockItemData = {
  moduleIcon: img.iconStockManagement_new,
  moduleName: '入库-批次',
  extractIcon: img.iconRightArrowGray,
  moduleKey: 'StockManage',
};
let storageItemData = {
  moduleIcon: img.iconStockManagement_new,
  moduleName: '入库-货品',
  extractIcon: img.iconRightArrowGray,
  moduleKey: 'StorageGoods',
};

StockManage 入库批次  SaleBatchAdd 新增入库批次  CellHourView




SupplierList 货主管理的列表数据
SupplierDetails  货主列表详情页。


订单
OrderManagement 订单管理
OrderDetail 订单详情
OrderDetailForCode 码单详情



cuwebview
 this.token += `&versionCode=${'18905'}`;



```js
   {this.isEdit ? (
              <View
                style={[
                  bs.rowSbC,
                  bs.setPaddingLeft(32),
                  bs.setPaddingRight(64),
                  bs.setDirectHeight(sz.unitWidth * 88),
                ]}
              >
                <Text style={[bs.setFont(28), bs.setBold(500), bs.setColor(color.listTwoLeveleTextGrayColor)]}>
                  入库时间
                </Text>
                <Text style={[bs.setFont(28), bs.setColor(color.text_normal_black), bs.setBold('bold')]}>
                  {createTime}
                </Text>
              </View>
            ) : (
              <CellHourView
                name='creditTime'
                value={createTime}
                backgroundColor={color.background_white_common} // 背景颜色
                isFullWidth={true}
                // maxDate={this.maxCreditTime}
                cellTitle='入库时间'
                // 校验的类型
                validateType={ValidateType.cellTime}
                returnAndroidPicker={this.returnAndroidPicker}
                returnValue={(value: any) => {
                  this.hasChanged;
                  this.setState({
                    createTime: Array.isArray(value) ? value.join('') : value,
                  });
                }}
              />
            )}
```


[] 分享结算单页面优化    接口授权报错，后台无时间看
[] 货主付款页面代卖批次增加批次创建时间显示 app和财务端   待联调接口
[] 有退货抵扣的订单不支持直接作废，需要拦截 app和财务端









CellHourView

CellTimeView
        <CellTimeView
          name='creditTime'
          value={defaultDate}
          backgroundColor={color.background_white_common} // 背景颜色
          // 是否必填
          requisite={true}
          isFullWidth={true}
          cellTitle='赊欠时间'
          // 校验的类型
          validateType={ValidateType.cellTime}
          returnValue={(value: any) => {}}
          titleStyle={[bs.setFont(32), bs.setColor(color.text_main_title)]}
          valueStyle={[bs.setFont(32), bs.setColor(color.text_subtitle), bs.setBold('normal')]}
        />






财务端

拖动排序  newPages/BuyerManage/BuyerDetail/index.tsx  line: 513

app
business/buyer/buyerClassManagement/index.js   SortableList








1. 删除码单  OrderDetailForCode --BottomArea--line：56     `PERMISSION_DELETE_MEMO`
```js
 this.isHaveMemoButton = checkPermission(Permission.PERMISSION_OPEN_MEMO);
 PERMISSION_OPEN_MEMO

```

2. 下单选择时间  SaleSeletBuyerHeaderView--line: 102  CellHourViewForCash   `PERMISSION_CREATE_ORDER_TIME`
```js
import SaleSeletBuyerHeaderView from '../components/gathering/selectBuyerHeader';
```

暂未设置权限

3. 交账前作废  h5  `PERMISSION_PRE_HAND_CANCEL`
OrderDetail
const OrderDetail = loadable(() => import('./pages/appAndPos/orderDetail'));



```js
line: 138
  function getCancelFlag() {
    let flag = false;
    if (handId > 0 && !checkPermission(Permission.PERMISSION_HAND_CANCEL)) {
      return false;
    }
    if (
      statusWatermark === STATUS_WATER_MARK.ORDER_RETURN ||
      statusWatermark === STATUS_WATER_MARK.ORDER_PAY_COMPLETED ||
      statusWatermark === STATUS_WATER_MARK.ORDER_CREDIT
    ) {
      flag = true;
    }
    return flag;
  }

  export const STATUS_WATER_MARK = {
  /**
   * 已结清 1
   */
  ORDER_PAY_COMPLETED: 1,

  /**
   * 赊欠单 3
   */
  ORDER_CREDIT: 3,
  /**
   * 退款 11
   */
  ORDER_REFUND: 11,
  /**
   * 白条 9
   */
  ORDER_WHITE: 9,

  /**
   * 作废 13
   */
  ORDER_CANCEL: 13,
  /**
   * 退货 25
   */
  ORDER_RETURN: 25,
};
```



4. 新增买家 买家管理   BuyerManage ---> ContenerView  line 638   `PERMISSION_BUYER_CREATE`
5. 停用启用买家  BuyerDetail line: 261 修改---> AddBuyerFormPage  （ tag: 'modifyBuyer'）  line 737  `PERMISSION_BUYER_ENABLE`
   ```js
    {!this.isAddBuyer ? (
          <FormRadio
            name='enable'
            title={
              <View>
                <Text style={[f.h2, bs.setColor(color.text_main_title)]}>停用买家</Text>
              </View>
            }
            {...this._getNetEditStateValue('enable')}
            backgroundColor={color.background_white_common} // 背景颜色
            backStyle={[bs.setPaddingVertical(24)]}
          />
        ) : null}
   ```

6. 买家修改   BuyerDetail line: 261 修改  `PERMISSION_BUYER_EDIT`
   ```js
       rightItem =
      this.buyerId === 0
        ? {}
        : {
            customContent: (
              <TouchableOpacity
                clickInterval={1000}
                onPress={() => {
                  this.pushModificationBuyer(false);
                }}
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
              >
                <Text
                  style={{
                    lineHeight: 40 * sz.unitWidth,
                    fontSize: 32 * sz.unitWidth,
                    fontWeight: '500',
                    color: color.text_green,
                  }}
                >
                  修改
                </Text>
              </TouchableOpacity>
            ),
          };
   ```
7. 删除买家   仅一个地方 滑动删除  接口deleteBuyer   BuyerManage页面 --  ContenerView  line：431   `PERMISSION_BUYER_DELETE`

app/business/buyer/addBuyer





8. H5   买家预存  暂未找到  `PERMISSION_BUYER_PRESTORE`

src pages/appAndPos/buyerDetail730/components/purchase.js  line80 行隐藏图片以及跳转事件



9. 货品新增   我的-货品管理-新增货品  GoodsManage line: 475  `PERMISSION_GOODS_ADD`
  
    - 开单 左侧新增货物，新增批次  右侧货物为空的时候新增货物，新增批次
    - 选择货物，右侧顶部按钮。
    - 我的-货品管理-新增货品
  ```js
      <BottomButton onPress={this.goAddGoodsPage} style={[bs.setWidth(328)]} title='新增货品' />
  ```

10.   货品修改  箭头显示与否 renderGoodsItem方法 1.不显示箭头  props.arrow传false即可   2. fun onGoodsItemClick要直接return   `PERMISSION_GOODS_EDIT`   
  





  **缺 删除货品  02.005.005 货品管理滑动删除，注意停用的展示  和编辑页面，启用停用货品  02.005.006**

  



11.    修改货主 SupplierDetail  此页面仅改h5   supplierV630 line: 303   funcData  `PERMISSION_SUPPLIER_EDIT`
      
      ```js
        const SupplierDetailV630 = loadable(() => import('./pages/app/supplierV630'));

      ```
12.  停用货主和11一样   如果两个都没有权限会不显示  "更多操作" s/app/supplierV630  line 327    `PERMISSION_SUPPLIER_ENABLE`

**缺 删除货主  02.006.005**



13.  撤销打款 付款记录 撤销打款  `PERMISSION_SUPPLIER_PAYMENT_CANCEL`

14. 售罄/取消售罄批次  `DMStockDetail`        已有权限，但是没用到PERMISSION_CANCEL_SELL_OUT
    ```js
          <RoundButton
                  onPress={this.handleSaleout}
                  theme='borderRed'
                  style={[bs.setHeight(88), bs.setWidth(335), bs.setBorderRadius(8)]}
                  title='售罄'
                  font={{ ...bs.setFont(28), ...bs.setBold('bold') }}
                />

    ```

15. 添加费用     `PERMISSION_ADD_FEE`
16. 设置代卖费 已有
  `const AppBatchDetailV630 = loadable(() => import('./pages/app/batchV630/batchDetail'));`
  设置代卖费用

      const isCheckOut = settlementStatus === '1';  已结完
     const isSelfSupport = batchSaleType === BATCH_SALE_TYPE.self_support_and_sale_batch; // 自营按批次
    this.settleRulePermission = checkPermission(Permission.PERMISSION_SETTLEMENT_SETTLE_RULE);   //设置规则'02.015.006'

 
  ```js
     {isCheckOut || financeInfo.length === 0 || isSelfSupport ? null : this.settleRulePermission ? (
              <div
                className='section2-2new app-active-btn-opacity'
                onClick={() => {
                  this.ruleModal?.show();
                }}
              >
                <img alt='' src={settingSvg} />
                设置代卖费用
              </div>
            ) : null}

  ```

  ```js
   {financeList.length === 0 && (isCheckOut || isSelfSupport) ? null : (
            <div className='section2-1 section2-5'>
              {`${productTitle}费用`}
              {!isCheckOut && this.addFeePermission && !isSelfSupport ? (
                <div
                  className='section2-2 app-active-btn-opacity'
                  onClick={() => {
                    this.selectedFeeEditData = null;
                    this.addFee();
                  }}
                >
                  <img alt='' src={addSvg} />
                  添加费用
                </div>
              ) : null}
            </div>
          )}
  ```

17. 删除库存操作记录    - 库存-入库货品-库存操作-库存记录-操作  app上好像没有
18. 批次结算分享 BatchCountV630 页面  line: 105行 货主详情-全部批次-批次详情       - 管理-结算管理-已结完批次详情-分享
  ```js
 onItemClick = (item: any) => {
    navigatorTool.setProps(this.props).push('PublicWeb', {
      title: '批次详情',
      url: `app-batch-detail-v630?batchId=${item.batchId}`,
      headerConfig: {
        showBottomLine: false,
      },
      rightItem:
        item.settlementStatus === '1'
          ? {
              type: 'rightBtn',
              rightBtnLayout: 'title',
              rightBtnTitle: '分享',
            }
          : {},
    });
  };
  ```

MixCashHome 开单页面

GoodsSearch l:BatchListVieww  r： GoodsListView  
  ---> 跳转到购物车  ShopCar（ShopCarContent line: 660）
    --->  CashHome开码单
    --->  Gathering 下单(GatheringView --SaleSeletBuyerHeaderView--line: 102  CellHourViewForCash)
    









```js
 <CustomModal
        title='分类管理'
        open={manageOpen}
        footer={null}
        width={400}
        destroyOnClose={true}
        onCancel={() => setManageOpen(false)}
        zIndex={9}
      >
        <div className={styles.manageModal}>
          <div className={styles.scroll}>
            <SortList
              dataSource={[...cateList]}
              onEdit={(item: any) => {
                editCateModal();
                // fix
                setTimeout(() => {
                  form2.setFieldsValue({ ...item });
                }, 0);
              }}
              onDel={(item: any) => {
                deleteCate(item);
              }}
              onSort={(data: any) => onSort(data)}
              onClick={({ id }: any) => {
                form.setFieldValue('categoryId', id);
                setManageOpen(false);
              }}
            />
          </div>
          <div className={styles.footer}>
            <div
              className={styles.btn}
              onClick={() => {
                form1.resetFields();
                addCateModal();
              }}
            >
              添加分类
            </div>
          </div>
        </div>
      </CustomModal>
```














    let operRoleList = [
      '02.004.007',
      '02.003.011',
      '02.003.012',
      '02.006.001',
      '02.015.001',
      '02.004.004',
      '02.003.008',
      '02.016.002',
      '02.016.004',
      '02.016.006',
      '02.015.006',
      '02.015.002',
      '02.015.005',
      '02.006.006',
      '02.009.002',
      '02.009.004',
      '02.009.005',
      '02.009.040',
      '02.003.030',
      '02.017.004',
      '02.007.001',
      '02.006.002',
    ];






权限

```js

1. 录入白条  02.003.006   // 完成
2. √新增员工  02.007.002    // 完成
3. √停用/启用员工 02.007.005  // 完成
4. √修改员工  02.007.004     // 完成
5. √新增货品  02.005.002   // 完成
6. √修改货品  02.005.004   // 完成
7. √新增入库单/批次  02.009.002  // 完成  以前就有
8. √修改入库单/批次   02.009.004  // 完成  以前就有
9. √删除入库单/批次   02.009.005 // 完成  以前就有
10. √录入/修改采购成本  02.013.003 // 完成  以前就有
11. √添加入库费用    02.016.002  //完成   和28重复
12. √库存操作（调出/盘点/报损）  02.009.040  // 完成  以前就有
13. √删除库存操作记录   02.009.008 // 完成 app无
14. √新增买家  02.004.002  // 完成 
15. √修改买家  02.004.008 // 完成，控制入口权限
16. √停用/启用买家  02.004.009 // 完成 
17. √删除买家   02.004.005 // 完成 右划删除
18. √设置买家预存（充值/退预存）   02.004.010 // 未完成h5  buyerDetail730  appAndPos/buyerDetail730/components/purchase.js 
19. √欠筐调整   02.017.004  // 未完成  TODO
20. √还款   02.004.007 //  完成 以前就有
21. √开码单  02.003.007 //  完成 以前就有
22. √删除码单  02.003.014 //  完成 
23. √开订单   02.003.002//  完成 以前就有
24. √下单选择时间  02.003.015//  完成 
25. √修改白条/订单           当班改单   02.003.030  交账后改单 02.003.012  // 未完成h5 /appAndPos/orderDetail
26. √作废白条/订单 作废       交账前作废  02.003.016   交账后作废  02.003.008 // 未完成h5  /appAndPos/orderDetail

27. √售罄/取消售罄批次       02.009.006 // 完成h5  app已加剩余h5页面 batchdetailV630
28. √设置批次费用    02.009.007  添加费用 code有问题 02.016.002 // 完成h5  以前就有  设置批次费用  batchdetailV630
29. √设置代卖费      02.015.006  // 完成h5  以前就有   batchdetailV630
30. √分享结算单   批次结算分享   02.015.007 // 完成
31. √批次结算      - 货主-批次结算-去结算 02.015.002    //// 完成h5  以前就有 batchdetailV630 底部去结算按钮
32. √取消结算      02.015.005   //完成h5 batchdetailV630 结算记录
33. √新增货主      02.006.002   //  完成 以前就有
34. √修改货主信息   02.006.004  //未完成h5   supplierV630 line: 303 
35. √停用货主      02.006.007   // 未完成h5   supplierV630 line: 327 
36. √货主打款     02.006.006    // 未完成h5   supplierV630 货主详情去付款
37. √撤销打款     02.006.008   // 未完成h5      付款记录的撤销    √
38. √退货       02.003.013  //未完成h5 订单详情已有  买家详情还没加  PERMISSION_RETURN_ORDER   √



```


售罄/取消售罄批次  取消结算 


//7.4.0新增权限列表: 由于上线后客户未刷新权限码，此处需要做兼容处理
//TODO 7.4.1及后续版本可删除上逻辑
const PermissionCode731 = ['02.003.016', '02.006.004', '02.006.005', '02.006.007', '02.006.008', '02.009.006', '02.009.008', '02.015.007'];

const PermissionCode731 = ['02.003.016', '02.006.004', '02.006.005', '02.006.007', '02.006.008', '02.009.006', '02.009.008', '02.015.007', '02.009.040', '02.013.003', '02.015.002', '02.015.005', '02.015.006', '02.016.002', '02.016.004', '02.016.006', ''];








h5以及未完成的

    ```js

    3. 交账前作废 02.003.016，交账前改单02.003.030 h5  `PERMISSION_PRE_HAND_CANCEL`
OrderDetail
const OrderDetail = loadable(() => import('./pages/appAndPos/orderDetail'));




line: 138
  function getCancelFlag() {
    let flag = false;
    if (handId > 0 && !checkPermission(Permission.PERMISSION_HAND_CANCEL)) {
      return false;
    }
    if (
      statusWatermark === STATUS_WATER_MARK.ORDER_RETURN ||
      statusWatermark === STATUS_WATER_MARK.ORDER_PAY_COMPLETED ||
      statusWatermark === STATUS_WATER_MARK.ORDER_CREDIT
    ) {
      flag = true;
    }
    return flag;
  }

  export const STATUS_WATER_MARK = {
  /**
   * 已结清 1
   */
  ORDER_PAY_COMPLETED: 1,

  /**
   * 赊欠单 3
   */
  ORDER_CREDIT: 3,
  /**
   * 退款 11
   */
  ORDER_REFUND: 11,
  /**
   * 白条 9
   */
  ORDER_WHITE: 9,

  /**
   * 作废 13
   */
  ORDER_CANCEL: 13,
  /**
   * 退货 25
   */
  ORDER_RETURN: 25,
};






8. H5   买家预存  暂未找到  `PERMISSION_BUYER_PRESTORE`

src pages/appAndPos/buyerDetail730/components/purchase.js  line80 行隐藏图片以及跳转事件


11.    修改货主 SupplierDetail  此页面仅改h5   supplierV630 line: 303   funcData  `PERMISSION_SUPPLIER_EDIT`
      
      ```js
        const SupplierDetailV630 = loadable(() => import('./pages/app/supplierV630'));

      ```

      12.  停用货主和11一样   如果两个都没有权限会不显示  "更多操作" s/app/supplierV630  line 327    `PERMISSION_SUPPLIER_ENABLE`




都是批次详情页面


售罄：h5页面批次详情  batchdetailV630    line910
去结算：  
取消结算

添加费用

  ```js
   {financeList.length === 0 && (isCheckOut || isSelfSupport) ? null : (
            <div className='section2-1 section2-5'>
              {`${productTitle}费用`}
              {!isCheckOut && this.addFeePermission && !isSelfSupport ? (
                <div
                  className='section2-2 app-active-btn-opacity'
                  onClick={() => {
                    this.selectedFeeEditData = null;
                    this.addFee();
                  }}
                >
                  <img alt='' src={addSvg} />
                  添加费用
                </div>
              ) : null}
            </div>
          )}
  ```



撤销打款 h5页面


    ```











    删除库存操作记录 ???????????
    欠框调整 ???????????









  权限






packKind === 7 是拆包






  


1. 【P0】权限优化                         **完成**
    - 运营端权限配置                      **完成**
    - APP                               **完成**
    - 财务端
2. √【P0】免实施，我的模块
3.  √【【P3】运营端配置管理，支持筛选正式/测试商行
4. √【P3】APP展示增值功能  我的，广告推广的    运营端0.5  移动端0.5  



5. √【P2】库存盘点相关优化
    - 新增/修改批次/入库支持调整货品排序 
       - APP
       - 财务端  1天                     **完成**
    - 货品增加按库存数量/重量排序  财务端    **完成**
    - 货品增加按库存数量/重量排序  App
 

6. 【P1】收筐、收入、支出、费用优化     **完成**
    -  单独收筐/收入/支出支持选择时间      **完成**
    -  APP（单独收筐/收入/支出） 0.5天     **完成**
    -  财务端（收入/支出）0.5天    **完成**
    
    
    
    
    
    
    PERMISSION_SUPPLIER_PAYMENT  02.006.006
      [Permission.PERMISSION_SUPPLIER_PAYMENT, '02.006.006'],
