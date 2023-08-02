// const beautify = require('js-beautify').js
const fs = require('fs');

const generateArray = [

	{ label: '采购年度', type: 'datetime', key: 'purchaseYear' },
	{ label: '采购地域', type: 'input', key: 'purchaseRegion' },
	{ label: '采购预算金额', type: 'input', key: 'purchaseBudget' },
	{ label: '采购用途', type: 'input', key: 'purchasePurpose' },


	//基本信息
	{ label: '采购人', type: 'input', key: 'purchaser' },
	{ label: '联系方式', type: 'input', key: 'phone' },
	{ label: '其他需求', type: 'input', key: 'otherRequirement' },
	{ label: '备注', type: 'input', key: 'notes' },


	{ label: '收货地址', type: 'select', key: 'traderAddressId' },

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
