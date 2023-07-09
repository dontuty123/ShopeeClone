import { useMutation, useQuery } from '@tanstack/react-query'
import purchaseApi from 'src/apis/pruchase.api'
import { PurchasesStatus } from 'src/constants/pruchase'
import { Link } from 'react-router-dom'
import path from 'src/constants/path'
import { formatCurrency, generateNameId } from 'src/utils/utils'
import QuantityController from 'src/components/QuantityController/QuantityController'
import Button from 'src/components/Button'
import { useEffect, useState } from 'react'
import { Purchase } from 'src/types/purchase.type'
import produce from 'immer'
import { queryClient } from 'src/main'
import { toast } from 'react-toastify'

interface ExtendedPurchase extends Purchase {
  disabled: boolean
  checked: boolean
}

export default function Cart() {
  const [extendedPurchases, setExtendedPurchases] = useState<ExtendedPurchase[]>([])
  const { data: purchasesInCartData } = useQuery({
    queryKey: ['purchases', { status: PurchasesStatus.inCart }],
    queryFn: () => purchaseApi.getPurchases({ status: PurchasesStatus.inCart }),
  })

  const updatePurchaseMutation = useMutation({
    mutationFn: (body: { product_id: string; buy_count: number }) => purchaseApi.updatePurchase(body),
  })

  const buyProductMutation = useMutation({
    mutationFn: purchaseApi.buyProduct,
    onSuccess: (data) => {
      toast.success(data.data.message, { autoClose: 1500 })
      queryClient.invalidateQueries(['purchases', { status: PurchasesStatus.inCart }])
    },
  })

  const deletePurchaseMutation = useMutation({
    mutationFn: (purchaseIds: string[]) => purchaseApi.deletePurchase(purchaseIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchases', { status: PurchasesStatus.inCart }])
    },
  })

  const purchasesInCart = purchasesInCartData?.data.data
  const isAllChecked = extendedPurchases.every((purchase) => purchase.checked)
  const checkedPurchase = extendedPurchases.filter((purchase) => purchase.checked)
  const checkedPurchaseCount = checkedPurchase.length
  const paymentCount = checkedPurchase.reduce((resolve, current) => {
    return resolve + current.price
  }, 0)

  const paymentSavingCount = checkedPurchase.reduce((resolve, current) => {
    return resolve + (current.price_before_discount - current.price)
  }, 0)

  useEffect(() => {
    setExtendedPurchases(
      purchasesInCart?.map((purchase) => ({
        ...purchase,
        disabled: false,
        checked: false,
      })) || [],
    )
  }, [purchasesInCart])

  const handleChecked = (purchaseIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setExtendedPurchases(
      produce((draft) => {
        draft[purchaseIndex].checked = event.target.checked
      }),
    )
  }

  const handleCheckAll = () => {
    setExtendedPurchases((prev) =>
      prev.map((purchase) => ({
        ...purchase,
        checked: !isAllChecked,
      })),
    )
  }

  const handleQuantity = (purchaseIndex: number, value: number) => {
    const purchase = extendedPurchases[purchaseIndex]
    setExtendedPurchases(
      produce((draft) => {
        draft[purchaseIndex].disabled = true
      }),
    )
    if (value >= 1 && value <= purchase.product.quantity && value !== purchase.buy_count) {
      updatePurchaseMutation.mutate({ product_id: purchase.product._id, buy_count: value })
    }

    setExtendedPurchases(
      produce((draft) => {
        draft[purchaseIndex].disabled = false
        draft[purchaseIndex].buy_count = value
      }),
    )
  }

  const handleTypeQuantity = (purchaseIndex: number, value: number) => {
    setExtendedPurchases(
      produce((draft) => {
        draft[purchaseIndex].buy_count = value
      }),
    )
  }

  const handleDelete = (purchaseIndex: number) => () => {
    const purchaseId = extendedPurchases[purchaseIndex]._id
    deletePurchaseMutation.mutate([purchaseId])
  }

  const handleDeleteManyPurchases = () => {
    const purchaseIds = checkedPurchase.map((purchase) => purchase._id)
    deletePurchaseMutation.mutate(purchaseIds)
  }

  const handleBuyPurchases = () => {
    if (checkedPurchase.length > 0) {
      const body = checkedPurchase.map((purchase) => ({
        product_id: purchase.product._id,
        buy_count: purchase.buy_count,
      }))
      buyProductMutation.mutate(body)
    }
  }

  return (
    <div className='bg-neutral-100 py-16'>
      <div className='container'>
        <div className='overflow-auto'>
          <div className='min-w-[1000px]'>
            <div className='grid grid-cols-12 rounded-sm bg-white px-9 py-5 text-sm capitalize text-gray-500 shadow'>
              <div className='col-span-6 '>
                <div className='flex items-center'>
                  <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                    <input
                      type='checkbox'
                      className='h-5 w-5 accent-orange'
                      checked={isAllChecked}
                      onChange={handleCheckAll}
                    />
                  </div>
                  <div className='flex-grow text-black'>Sản phẩm</div>
                </div>
              </div>
              <div className='col-span-6'>
                <div className='grid grid-cols-5 text-center'>
                  <div className='col-span-2'>Đơn giá</div>
                  <div className='col-span-1'>Số lượng</div>
                  <div className='col-span-1'>Số tiền</div>
                  <div className='col-span-1'>Thao tác</div>
                </div>
              </div>
            </div>
            <div className='my-3 rounded-sm bg-white p-5 shadow'>
              {extendedPurchases?.map((purchase, index) => (
                <div
                  key={purchase._id}
                  className='mb-5 grid grid-cols-12 rounded-sm border border-gray-200 bg-white px-4 py-5 text-center text-sm text-gray-500 last:mb-0'
                >
                  <div className='col-span-6'>
                    <div className='flex'>
                      <div className='flex flex-shrink-0 items-center justify-center pr-3'>
                        <input
                          type='checkbox'
                          className='h-5 w-5 accent-orange'
                          checked={purchase.checked}
                          onChange={handleChecked(index)}
                        />
                      </div>
                      <div className='flex-grow'>
                        <div className='flex'>
                          <Link
                            to={`${path.home}${generateNameId({
                              name: purchase.product.name,
                              id: purchase.product._id,
                            })}`}
                            className='h-20 w-20 flex-shrink-0'
                          >
                            <img src={purchase.product.image} alt={purchase.product.name} />
                          </Link>
                          <div className='flex-5 px-2 pb-2 pt-1'>
                            <Link
                              to={`${path.home}${generateNameId({
                                name: purchase.product.name,
                                id: purchase.product._id,
                              })}`}
                              className='max-w-xs text-left line-clamp-2'
                            >
                              {purchase.product.name}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='col-span-6 flex'>
                    <div className='grid grid-cols-5 items-center self-center'>
                      <div className='col-span-2'>
                        <div className='flex items-center justify-center'>
                          <span className='text-gray-300 line-through'>
                            ₫{formatCurrency(purchase.product.price_before_discount)}
                          </span>
                          <span className='ml-3'>₫{formatCurrency(purchase.product.price)}</span>
                        </div>
                      </div>
                      <div className='col-span-1'>
                        <QuantityController
                          max={purchase.product.quantity}
                          value={purchase.buy_count}
                          classNameWrapper=''
                          onIncrease={(value) => handleQuantity(index, value)}
                          onType={(value) => handleTypeQuantity(index, value)}
                          onDecrease={(value) => handleQuantity(index, value)}
                          onFocusOut={(value) => handleQuantity(index, value)}
                          disabled={purchase.disabled}
                        />
                      </div>
                      <div className='col-span-1'>
                        <span className='text-orange'>
                          ₫{formatCurrency(purchase.product.price * purchase.buy_count)}
                        </span>
                      </div>
                      <div className='col-span-1'>
                        <button
                          className='bg-none text-black transition-colors hover:text-orange'
                          onClick={handleDelete(index)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='sticky bottom-0 z-10 mt-8 flex flex-col rounded-sm border border-gray-200 bg-white p-5 shadow sm:flex-row sm:items-center'>
          <div className='flex items-center'>
            <div className='flex flex-shrink-0 items-center justify-center pr-3'>
              <input
                type='checkbox'
                className='h-5 w-5 accent-orange'
                checked={isAllChecked}
                onChange={handleCheckAll}
              />
            </div>
            <button className='mx-3 border-none bg-none' onClick={handleCheckAll}>
              Chọn tất cả ({extendedPurchases.length})
            </button>
            <button className='mx-3 border-none bg-none' onClick={handleDeleteManyPurchases}>
              Xóa
            </button>
          </div>

          <div className='mt-5 flex flex-col sm:ml-auto sm:mt-0 sm:flex-row sm:items-center'>
            <div>
              <div className='flex items-center sm:justify-end'>
                <div>Tổng thanh toán ({checkedPurchaseCount} sản phẩm):</div>
                <div className='ml-2 text-2xl text-orange'>₫{formatCurrency(paymentCount)}</div>
              </div>
              <div className='flex items-center text-sm sm:justify-end'>
                <div className='text-gray-500'>Tiết kiệm</div>
                <div className='ml-6 text-orange'>₫{formatCurrency(paymentSavingCount)}</div>
              </div>
            </div>
            <Button
              onClick={handleBuyPurchases}
              disabled={buyProductMutation.isLoading}
              className='mt-5 flex h-10 w-48 items-center justify-center bg-orange text-center text-sm uppercase text-white hover:bg-red-600 sm:ml-4 sm:mt-0'
            >
              Mua hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
