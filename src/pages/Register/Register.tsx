import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Schema, schema } from 'src/utils/rules'
import { omit } from 'lodash'
import Input from 'src/components/Input'
import { useMutation } from '@tanstack/react-query'
import authApi from 'src/apis/auth.api'
import { AxiosError } from 'axios'
import { ErrorResponse } from 'src/types/utils.type'
import { toast } from 'react-toastify'
import { useContext } from 'react'
import { AppContext } from 'src/context/app.context'
import Button from 'src/components/Button'
import path from 'src/constants/path'

type RegisterType = Pick<Schema, 'email' | 'password' | 'confirm_password'>

export default function Register() {
  const { setIsAuthenticated, setProfile } = useContext(AppContext)
  const navigate = useNavigate()
  const addUserMutation = useMutation({
    mutationFn: (body: Omit<RegisterType, 'confirm_password'>) => {
      return authApi.registerAccount(body)
    },
    onError: (error: AxiosError<ErrorResponse<Omit<RegisterType, 'confirm_password'>>>) => {
      if (error.response?.data?.data) {
        toast.error(error.response?.data?.data?.email)
      } else {
        toast.error(error.message)
      }
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterType>({
    resolver: yupResolver<any>(schema.pick(['email', 'password', 'confirm_password'])),
  })

  const onSubmit = handleSubmit((data) => {
    const body = omit(data, ['confirm_password'])
    addUserMutation.mutate(body, {
      onSuccess: (data) => {
        setIsAuthenticated(true)
        setProfile(data.data.data.user)

        navigate('/')
      },
    })
  })

  return (
    <div className='bg-orange'>
      <div className='container'>
        <div className='grid grid-cols-1 py-12 lg:grid-cols-5 lg:py-16 lg:pr-10'>
          <div className='lg:col-span-2 lg:col-start-4'>
            <form className='rounded bg-white p-10 shadow-sm' onSubmit={onSubmit}>
              <div className='text-2xl'>Đăng ký</div>

              <Input
                className='mt-8'
                type='email'
                placeholder='Email'
                register={register}
                name='email'
                errorMessage={errors.email?.message}
              />
              <Input
                className='mt-3'
                type='password'
                placeholder='Password'
                register={register}
                name='password'
                errorMessage={errors.password?.message}
                autoComplete='on'
              />
              <Input
                className='mt-3'
                type='password'
                placeholder='Confirm Password'
                register={register}
                name='confirm_password'
                errorMessage={errors.confirm_password?.message}
                autoComplete='on'
              />

              <div className='mt-3'>
                <Button
                  disabled={addUserMutation.isLoading}
                  isLoading={addUserMutation.isLoading}
                  className='flex w-full  items-center justify-center bg-red-500 px-2 py-4 text-center text-sm uppercase text-white hover:bg-red-600'
                >
                  Đăng ký
                </Button>
              </div>

              <div className='mt-8 flex items-center justify-center'>
                <span className=' text-gray-400'>Bạn đã có tài khoản?</span>
                <Link className='ml-1 text-red-500' to={path.login}>
                  Đăng nhập
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
