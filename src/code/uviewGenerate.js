// const beautify = require('js-beautify').js
const fs = require('fs');

const generateArray = [
	{ label: '货物类型', type: 'radio', key: 'sheetType', options: [{ name: '2', label: '现货在仓' }, { name: '3', label: '预售' }] },
	{ label: '货物存放仓', type: 'radio', key: 'warehouseType', options: [{ name: '0', label: '平台仓监管' }, { name: '1', label: '第三方仓库货物' }] },
	{ label: '品种', type: 'select', key: 'productId' },


	{ label: '待售货物', type: 'choose', key: 'summaryId' },
	{ label: '货物中文名', type: 'input', key: 'name' },
	{ label: '货物英文名', type: 'input', key: 'enName' },
	{ label: 'sku', type: 'input', key: 'sku' },


	//基本信息
	{ label: '单价', type: 'input', key: 'unitPrice' },
	{ label: '重量', type: 'input', key: 'avaliableQuantity' },
	{ label: '单位', type: 'input', key: 'unitName' },
	{ label: '毛重', type: 'input', key: 'grossWeight' },
	{ label: '净重', type: 'input', key: 'netWeight' },
	{ label: '规格', type: 'input', key: 'spec' },
	{ label: '品牌', type: 'input', key: 'brand' },
	{ label: '原产国', type: 'input', key: 'productionCountry' },
	{ label: '有效期天数', type: 'input', key: 'expiryDays' },
	// ProductPropForm

	// 其他信息
	{ label: '箱规', type: 'input', key: 'boxQuantity' },
	{ label: '长', type: 'input', key: 'length' },
	{ label: '宽', type: 'input', key: 'width' },
	{ label: '高', type: 'input', key: 'height' },
	{ label: '货物图片', type: 'select', key: 'picture' },

	{ label: '货物状态', type: 'select', key: 'goodsStatus' },
	{ label: '货物名称', type: 'input', key: 'name' },



	//地理信息  3
	{ label: '面积(m²)', type: 'input', key: 'area' },
	{ label: '地块经纬度', type: 'input', key: 'longitudeAndLatitude' },
	{ label: '补充文件', type: 'select', key: 'annex' },
	{ label: '货物图片', type: 'select', key: 'picture' },

	// 预计生产信息  3
	{ label: '重量', type: 'input', key: 'avaliableQuantity' },
	{ label: '单价', type: 'input', key: 'unitPrice' },

	// sheetType 2  warehouseType 1  第三方
	{ label: '仓库', type: 'input', key: 'whId' },
	{ label: '仓库地址', type: 'input', key: 'whIdAddress' },
	{ label: '补充文件', type: 'select', key: 'annex' },
]


let code = `<template>
	<view class="edit-form-container">
		<u-form class="form-container" ref="uForm" :rules="xxxRules" :model="xxxModel" labelWidth="110"
			:borderBottom="false">`

let script = `<script>
	export default {
    data() {
        return {
            loading: false,
            xxxModel: {`
let rules = `xxxRules: {`

generateArray.map((item, index) => {
	if (item.type === 'input') {
		code += `\n <u-form-item :label="$t('${item.label}') " prop="${item.key}" borderBottom><u-input v-model="xxxModel.${item.key}" placeholder="请输入${item.label}" border="none"></u-input> </u-form-item>`
	} else if (item.type === 'radio') {
		code += `\n <u-form-item :label="$t('${item.label}') " prop="${item.key}">
                <u-radio-group v-model="xxxModel.${item.key}">`
		for (const optionItem of item.options) {
			code += ` <u-radio name="${optionItem.name}">{{ $t('${optionItem.label}') }}</u-radio>`
		}

		code += `\n  </u-radio-group>
            </u-form-item>`
	} else {
		code += `\n <q-form-item :label="$t('${item.label}')" :qModel="xxxModel.${item.key}" selectKey="${item.key}" type="${item.type}"
				@formClicked="selectClicked"></q-form-item>`
	}

	script += `${[item.key]}: '',`
	rules += `${[item.key]}:[{ required: true,trigger: ['blur', 'change'], message: \`请先填写\$\{this.$t('${item.label}')\}\`}],`

})



script = script + ' },' + rules + ' } }},' + `	onReady() {
			this.$refs.uForm.setRules(this.xxxRules)
		},methods:{	selectClicked(params) {
				const {
					selectKey,
					type
				} = params
				if (type === 'choose') {
					this.showChooseKey = selectKey
				} else if (type === 'datetime') {
					this.showDateTimeKey = selectKey
				} else if (type === 'rangeTime') {
					this.showRangeDateKey = selectKey
				} else {
					this.showSelectKey = selectKey
				}



			},
            submitForm() {
				this.$refs.uForm.validate().then(res => {
                    this.loading = true
					this.$minApi.transaction.saveReleaseSheet({
						...this.xxxModel,
						...this.submitParams,
					}).then(res => {
                        this.loading = false
						if (res.code === 0) {
							uni.$u.toast('提交成功')
							uni.navigateBack()
						}
					}).catch(error => {
                        this.loading = false
						console.log(error)

					})
				}).catch(errors => {
					uni.$u.toast('校验失败')
				})

			},}}</script><style lang="scss" scoped>	.edit-form-container {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		background-color: #ffffff;
		height: 100%;
		width: 100%;

		.form-container {
			flex-grow: 1;
			overflow-y: auto;
			padding: 16px;
		}

		.detail-part {
			background: #f2f2f2;
			padding: 16px 0;
			border-radius: 8px;
			margin-top: 5px;
		}

		.detailid-input-class {
			width: 50px;
			flex-shrink: 0;
			border: 1px solid #f2f2f2;
			padding: 5px 10px;
			height: 30px;
			margin-right: 5px;

		}
		.confirm-button{
			    height: 40px;
			    flex-shrink: 0;
		}

	}
</style>`

code += `		</u-form><u-button class="confirm-button" :loading="loading" type="primary" @click="submitForm">确定</u-button>
	</view>
</template>`

const totalCode = code + script
console.log(totalCode)
// console.log(beautify(totalCode, { indent_size: 2, space_in_empty_paren: true }));
