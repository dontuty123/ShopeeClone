import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { Link, createSearchParams } from 'react-router-dom'
import purchaseApi from 'src/apis/pruchase.api'
import path from 'src/constants/path'
import { PurchasesStatus } from 'src/constants/pruchase'
import useQueryParams from 'src/hooks/useQueryParams'
import { PurchaseListStatus } from 'src/types/purchase.type'
import { formatCurrency, generateNameId } from 'src/utils/utils'

const purchaseTab = [
  { status: PurchasesStatus.all, name: 'Tất cả' },
  { status: PurchasesStatus.waitForConfirmation, name: 'Chờ xác nhận' },
  { status: PurchasesStatus.waitForGetting, name: 'Chờ lấy hàng' },
  { status: PurchasesStatus.inProgress, name: 'Đang giao' },
  { status: PurchasesStatus.delivered, name: 'Đã giao' },
  { status: PurchasesStatus.cancelled, name: 'Đã hủy' },
]

export default function HistoryPurchase() {
  const queryParams: { status?: string } = useQueryParams()
  const status: number = Number(queryParams.status) || PurchasesStatus.all

  const { data: purchasesInCartData } = useQuery({
    queryKey: ['purchases', { status }],
    queryFn: () => purchaseApi.getPurchases({ status: status as PurchaseListStatus }),
  })

  const purchasesInCart = purchasesInCartData?.data.data

  const purchaseTabsLink = purchaseTab.map((tab) => (
    <Link
      key={tab.status}
      to={{
        pathname: path.historyPurchase,
        search: createSearchParams({
          status: String(tab.status),
        }).toString(),
      }}
      className={classNames('flex flex-1 items-center justify-center border-b-2 bg-white py-4 text-center', {
        'border-b-orange text-orange': status === tab.status,
        'border-b-black/10 text-gray-900': status !== tab.status,
      })}
    >
      {tab.name}
    </Link>
  ))

  return (
    <div>
      <div className='sticky top-0 flex rounded-t-sm shadow-sm'>{purchaseTabsLink}</div>
      <div>
        {purchasesInCart?.map((purchase) => (
          <div key={purchase._id} className='mt-4 rounded-sm border-black/10 bg-white p-6 text-gray-800 shadow-sm'>
            <Link
              className='flex'
              to={`${path.home}${generateNameId({ name: purchase.product.name, id: purchase.product._id })}`}
            >
              <div className='flex-shrink-0'>
                <img src={purchase.product.image} alt={purchase.product.name} className='h-20 w-20 object-cover' />
              </div>
              <div className='ml-3 flex-grow overflow-hidden'>
                <div className='truncate'>{purchase.product.name}</div>
                <div className='mt-3'>x{purchase.buy_count}</div>
              </div>
              <div className='ml-3 flex-shrink-0'>
                <span className='truncate text-gray-500 line-through'>
                  ₫{formatCurrency(purchase.product.price_before_discount)}
                </span>
                <span className='ml-2 truncate text-orange'>₫{formatCurrency(purchase.product.price)}</span>
              </div>
            </Link>
            <div className='my-2 border-0 border-b'></div>
            <div className='flex justify-end'>
              <div>
                <span>Tổng giá tiền</span>
                <span className='ml-4 text-xl text-orange'>
                  ₫{formatCurrency(purchase.product.price * purchase.buy_count)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
