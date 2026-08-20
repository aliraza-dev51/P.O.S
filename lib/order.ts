import { Order } from "@prisma/client"

export enum orderOperations{
    getOrderById,
    getOrderCountByDateRange,
    getOrderRevenueByDateRange,
    getOrderIncomeByDateRange,
    getOrderSummaryByDateRange,
    getOrderProductsByDateRange,
    getOrdersByDateRange,
    updateOrderById,
}

type orderSummaryResponse = {
    orderedDate: string
    discount: number
    rounding: number
    orderLine: {
        quantity: number
        buyUnitPrice: number
        sellUnitPrice: number
    }[]
}

export type orderSummaryByDate = {
    date: string
    sales: number
    revenue: number
    income: number
}

export async function getOrders() {
    const res = await fetch(`/api/orders`, {
        cache: 'no-store'
    }).then((res) => res.json())
    return res
}

export async function getOrderById(orderId: string) {
    const query = {
        queryType: orderOperations.getOrderById,
        orderId: orderId,
    }
    const res = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json())
    return res
}

export async function getOrderCountByDateRange(from: Date, to: Date) {
    console.log("DATERNGE KEPANGGIL WOY")
    const query = {
        queryType: orderOperations.getOrderCountByDateRange,
        from: from,
        to: to,
    }
    const res: number = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json())
    return res
}

export async function getOrderRevenueByDateRange(from: Date, to: Date) {
    const query = {
        queryType: orderOperations.getOrderRevenueByDateRange,
        from: from,
        to: to,
    }
    const res: number = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json())
    return res
}

export async function getOrderIncomeByDateRange(from: Date, to: Date) {
    const query = {
        queryType: orderOperations.getOrderIncomeByDateRange,
        from: from,
        to: to,
    }
    const res: number = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json())
    return res
}

export async function getOrderSummaryByDateRange(from: Date, to: Date) {
    const query = {
        queryType: orderOperations.getOrderSummaryByDateRange,
        from: from,
        to: to,
    }
    const res: orderSummaryResponse[] = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json())

    const orderSummary: orderSummaryByDate[] = []
    const currentDate = new Date(from)
    let i = 0

    while (currentDate <= to) {
        const currentDateString = currentDate.toLocaleDateString("id")
        orderSummary.push({
            date: currentDateString,
            sales: 0,
            revenue: 0,
            income: 0,
        })

        while (i < res.length) {
            const orderDateString = new Date(res[i].orderedDate).toLocaleDateString("id")
            if (orderDateString === currentDateString) {
                let revenue = res[i].rounding - res[i].discount 
                let income = res[i].rounding - res[i].discount
                for (let orderLine of res[i].orderLine) {
                    revenue += orderLine.sellUnitPrice * orderLine.quantity
                    income += (orderLine.sellUnitPrice - orderLine.buyUnitPrice) * orderLine.quantity
                }

                orderSummary[orderSummary.length - 1].sales += 1
                orderSummary[orderSummary.length - 1].revenue += revenue
                orderSummary[orderSummary.length - 1].income += income

                i += 1
            }
            else {
                break
            }
        }


        currentDate.setDate(currentDate.getDate() + 1)
    }

    return orderSummary
}

export async function getOrdersByDateRange(from: Date, to: Date) {
    const query = {
        queryType: orderOperations.getOrdersByDateRange,
        from: from,
        to: to,
    }
    const res = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json())
    console.log(res)
    return res
}

export async function updateOrderById(order: Order) {
    const query = {
        queryType: orderOperations.updateOrderById,
        order: {
            id: order.id,
            customerId: order.customerId,
            employeeId: order.employeeId,
            requiredDate: order.requiredDate,
        }
    }
    const res = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((res) => res.json())
    return res
}
