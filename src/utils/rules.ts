import type { RegisterOptions } from 'react-hook-form'
import * as yup from 'yup'

type RulesType = {
  [key in 'email' | 'password' | 'confirm_password']?: RegisterOptions
}

export const rules: RulesType = {
  email: {
    required: {
      value: true,
      message: 'Vui lòng không bỏ trống email',
    },
    pattern: {
      value: /^\S+@\S+\.\S+$/,
      message: 'Email không đúng định dạng',
    },
    minLength: {
      value: 5,
      message: 'Email phải có từ 5-160 ký tự', // JS only: <p>error message</p> TS only support string
    },
    maxLength: {
      value: 160,
      message: 'Email phải có từ 5-160 ký tự', // JS only: <p>error message</p> TS only support string
    },
  },

  password: {
    required: {
      value: true,
      message: 'Vui lòng không bỏ trống mục này',
    },
    minLength: {
      value: 6,
      message: 'Email phải có từ 6-160 ký tự', // JS only: <p>error message</p> TS only support string
    },
    maxLength: {
      value: 160,
      message: 'Email phải có từ 6-160 ký tự', // JS only: <p>error message</p> TS only support string
    },
  },
  confirm_password: {
    required: {
      value: true,
      message: 'Vui lòng không bỏ trống mục này',
    },
    minLength: {
      value: 6,
      message: 'Email phải có từ 6-160 ký tự', // JS only: <p>error message</p> TS only support string
    },
    maxLength: {
      value: 160,
      message: 'Email phải có từ 6-160 ký tự', // JS only: <p>error message</p> TS only support string
    },
  },
}

export const schema = yup.object({
  email: yup
    .string()
    .required('Vui lòng không bỏ trống email ')
    .email('Email không đúng định dạng')
    .min(5, 'Email phải có từ 5-160 ký tự')
    .max(160, 'Email phải có từ 5-160 ký tự'),
  password: yup
    .string()
    .required('Vui lòng không bỏ trống mục này ')
    .min(6, 'password phải có từ 6-160 ký tự')
    .max(160, 'Email phải có từ 6-160 ký tự'),
  confirm_password: yup
    .string()
    .required('Vui lòng không bỏ trống mục này ')
    .min(6, 'password phải có từ 6-160 ký tự')
    .max(160, 'Email phải có từ 6-160 ký tự')
    .oneOf([yup.ref('password')], 'Nhập lại password không khớp'),
  price_min: yup.string().test({
    name: 'price-not-allowed',
    message: 'Giá không phù hợp',
    test: function () {
      const { price_max, price_min } = this.parent as { price_min: string; price_max: string }
      if (price_min !== '' && price_max !== '') {
        return Number(price_max) >= Number(price_min)
      }
      return price_min !== '' || price_max !== ''
    },
  }),
  price_max: yup.string().test({
    name: 'price-not-allowed',
    message: 'Giá không phù hợp',
    test: function () {
      const { price_max, price_min } = this.parent as { price_min: string; price_max: string }
      if (price_min !== '' && price_max !== '') {
        return Number(price_max) >= Number(price_min)
      }
      return price_min !== '' || price_max !== ''
    },
  }),
  name: yup.string().trim().required(''),
})

export type Schema = yup.InferType<typeof schema>
