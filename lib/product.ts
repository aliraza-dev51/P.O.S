import { orderOperations } from "./order"

export enum productOperations{
    getProductNames,
}

type orderProductsSummaryResponse = {
    discount: number
    rounding: number
    orderLine: {
        quantity: number
        buyUnitPrice: number
        sellUnitPrice: number
        product: {
            name: string
        }
    }[]
}

type productName = {
    name: string
}

export type orderProductsSummary = {
    name: string
    revenue: number
    income: number
    sold: number
    orders: number
}

export async function getProducts() {
    const res = await fetch(`api/products`, {
    }).then((res) => res.json())

    return res
}

export async function getProductNames() {
    const query = {
        queryType: productOperations.getProductNames,
    }
    const res = await fetch(`api/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store',
    }).then((res) => res.json())

    return res
}

export async function getProductOrderSummaryByDateRange(from: Date, to: Date) {
    const query = {
        queryType: orderOperations.getOrderProductsByDateRange,
        from: from,
        to: to,
    }
    const orderRes: orderProductsSummaryResponse[] = await fetch(`api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
        cache: 'no-store'
    }).then((orderRes) => orderRes.json())

    const productRes: productName[] = await getProductNames()

    const productOrderSummaryObject: {[key: string]: orderProductsSummary} = {}
    for (let product of productRes) {
        productOrderSummaryObject[product.name] = {
            name: product.name,
            revenue: 0,
            income: 0,
            sold: 0,
            orders: 0,
        }
    }

    for (let order of orderRes) {
        // let orderTotal = 0
        // for (let orderLine of order.orderLine) {
        //     orderTotal += orderLine.sellUnitPrice * orderLine.quantity
        // }

        // let discountRounding = order.rounding - order.discount
        for (let orderLine of order.orderLine) {
            let revenue = orderLine.sellUnitPrice * orderLine.quantity
            let income = (orderLine.sellUnitPrice - orderLine.buyUnitPrice) * orderLine.quantity

            productOrderSummaryObject[orderLine.product.name].revenue += revenue
            productOrderSummaryObject[orderLine.product.name].income += income
            productOrderSummaryObject[orderLine.product.name].sold += orderLine.quantity
            productOrderSummaryObject[orderLine.product.name].orders += 1
        }
    }

    const productOrderSummaryArray: orderProductsSummary[] = Object.values(productOrderSummaryObject)

    return productOrderSummaryArray
}